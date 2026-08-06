# download.py — Descarga fuentes raw (HTML/PDF) con Playwright sync + httpx, respetando robots.txt.
"""Fetch raw normativa sources.

Playwright (sync) drives a headless Chromium for JS-heavy ARCA pages. PDF
sources are downloaded with httpx (simpler, no browser needed). A minimal
robots.txt check is applied per host before fetching.
"""

import io

import httpx
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import TimeoutError as PlaywrightTimeout
from playwright.sync_api import sync_playwright

from app.core.config import settings

ALLOWED_MIME_PREFIXES = ("text/html", "application/xhtml+xml")

# Minimum parsed-char delta used to detect JS-rendering shells: if the
# rendered DOM has at least this many more chars than the raw HTML (which a
# real static page never does), the raw body is treated as a shell and the
# rendered DOM is used instead.
_MIN_RAW_TEXT = 50


class NotFoundError(Exception):
    """The source is gone (HTTP 404/410)."""


class DisallowedError(Exception):
    """robots.txt disallows fetching this URL."""


class FetchResult:
    def __init__(self, data: bytes, content_type: str) -> None:
        self.data = data
        self.content_type = content_type

    @property
    def is_pdf(self) -> bool:
        return self.content_type == "application/pdf"

    @property
    def is_html(self) -> bool:
        return any(self.content_type.startswith(p) for p in ALLOWED_MIME_PREFIXES)


class RobotsChecker:
    """Very small robots.txt reader (only Disallow rules for our agent)."""

    def __init__(self, client: httpx.Client, user_agent: str) -> None:
        self._client = client
        self._agent = user_agent.split("/", 1)[0]
        self._cache: dict[str, list[str]] = {}

    def _disallowed_paths(self, host: str) -> list[str]:
        if host in self._cache:
            return self._cache[host]
        paths: list[str] = []
        url = f"https://{host}/robots.txt"
        try:
            resp = self._client.get(url, timeout=10.0)
            if resp.status_code == 200:
                paths = _parse_robots(resp.text, self._agent)
        except httpx.HTTPError:
            pass
        self._cache[host] = paths
        return paths

    def allowed(self, url: str) -> bool:
        from urllib.parse import urlparse

        parsed = urlparse(url)
        disallowed = self._disallowed_paths(parsed.hostname or "")
        path = parsed.path or "/"
        for rule in disallowed:
            if rule and (path.startswith(rule) or rule == "/"):
                return False
        return True


def _parse_robots(text: str, agent: str) -> list[str]:
    """Parse robots.txt, returning Disallow paths that apply to `agent`."""
    applying: list[str] = []
    current_agent: str | None = None
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip().lower(), value.strip()
        if key == "user-agent":
            if value == "*":
                current_agent = "*"
            elif current_agent != "*" and agent.lower() in value.lower():
                current_agent = agent
        elif key == "disallow" and current_agent == "*" or (
            current_agent == agent
        ):
            applying.append(value)
    return applying


class Fetcher:
    """Sync Playwright-based fetcher with PDF fallback and robots respect."""

    def __init__(
        self,
        user_agent: str | None = None,
        timeout_ms: int | None = None,
        robots: bool = True,
    ) -> None:
        self.user_agent = user_agent or settings.user_agent
        self.timeout_ms = timeout_ms or int(settings.request_timeout_seconds * 1000)
        self._robots_enabled = robots and settings.robots_check_enabled
        self._playwright = None
        self._browser = None
        self._httpx: httpx.Client | None = None
        self._robots_checker: RobotsChecker | None = None

    def __enter__(self) -> "Fetcher":
        self._playwright = sync_playwright().start()
        self._browser = self._playwright.chromium.launch(headless=settings.headless)
        self._httpx = httpx.Client(
            headers={"User-Agent": self.user_agent},
            follow_redirects=True,
            timeout=settings.request_timeout_seconds,
        )
        self._robots_checker = RobotsChecker(self._httpx, self.user_agent)
        return self

    def __exit__(self, *exc) -> None:
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()
        if self._httpx:
            self._httpx.close()

    def _check_robots(self, url: str) -> None:
        if self._robots_enabled and not self._robots_checker.allowed(url):
            raise DisallowedError(f"robots.txt blocks {url}")

    def fetch(self, url: str) -> FetchResult:
        self._check_robots(url)
        if url.lower().endswith(".pdf"):
            return self._fetch_pdf(url)
        return self._fetch_html(url)

    def _fetch_pdf(self, url: str) -> FetchResult:
        assert self._httpx is not None
        resp = self._httpx.get(url)
        if resp.status_code in (404, 410):
            raise NotFoundError(f"404 for {url}")
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "application/octet-stream")
        return FetchResult(resp.content, content_type.split(";")[0].strip())

    def _fetch_html(self, url: str) -> FetchResult:
        assert self._browser is not None
        context = self._browser.new_context(user_agent=self.user_agent)
        try:
            page = context.new_page()
            page.set_default_timeout(self.timeout_ms)

            body: bytes = b""
            final_status: int | None = None

            def _capture(resp) -> None:
                nonlocal body, final_status
                if resp.request.resource_type == "document":
                    final_status = resp.status
                    try:
                        body = resp.body()
                    except Exception:
                        # body() can fail for responses that are navigated
                        # away from (e.g. redirect chains); keep the last
                        # successful body and page.content() as fallback.
                        pass

            page.on("response", _capture)

            try:
                page.goto(url, wait_until="networkidle")
            except (PlaywrightTimeout, PlaywrightError):
                try:
                    page.goto(url, wait_until="domcontentloaded")
                except PlaywrightError:
                    pass

            if final_status in (404, 410):
                raise NotFoundError(f"{final_status} for {url}")

            # Prefer the raw response bytes: page.content() is a decoded DOM
            # string that corrupts sources whose bytes don't match their
            # declared charset (ARCA serves latin1 mislabeled as utf-8). But
            # some ARCA pages are JS-rendered: the raw HTML is only a shell
            # and the real text only exists in the rendered DOM. Detect that
            # when rendered content is substantially richer than the raw body
            # (a real short page renders about as much text as it sends).
            from app.ingestion.parser import parse_html

            if not body.strip():
                raise RuntimeError(f"Empty HTML for {url}")

            raw_len = len(parse_html(body))
            rendered = page.content()
            rendered_len = len(parse_html(rendered)) if rendered else 0

            if rendered_len > max(raw_len * 2, _MIN_RAW_TEXT):
                return FetchResult(rendered.encode("utf-8"), "text/html")

            return FetchResult(body, "text/html")
        finally:
            context.close()
