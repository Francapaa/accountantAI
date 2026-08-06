# discovery.py — Descubre links allowlisted desde páginas índice (deep 1) para ampliar la seed list.
"""Bounded link discovery from index pages.

Only pages flagged `discovery: true` in seed_urls.yaml are traversed. Only
allowlisted links (Electrónica Library details + ARCA help pages) are kept,
at depth 1 (links on index pages are ingested, but their own links are not
followed). See docs/sdd/007-scraper.md.
"""

from urllib.parse import urljoin, urldefrag, urlparse

from bs4 import BeautifulSoup

from app.ingestion.loader import infer_document_type, is_allowed
from app.ingestion.models import Seed

# Navigation / boilerplate links found on ARCA help index pages. These are not
# normative content and would pollute the corpus if ingested.
_NAV_PATH_MARKERS = (
    "contacto.asp",
    "default-ayuda.asp",
    "normativa.asp",  # the index itself
    "guias.asp",
    "tutoriales.asp",
)
_NAV_TEXTS = (
    "contacto",
    "inicio",
    "volver",
    "accesibilidad",
    "mapa del sitio",
)


def _is_nav(url: str, text: str) -> bool:
    path = urlparse(url).path.lower()
    if any(marker in path for marker in _NAV_PATH_MARKERS):
        return True
    return text.lower().strip() in _NAV_TEXTS


def _absolute_url(base: str, href: str) -> str | None:
    if not href:
        return None
    href = urldefrag(href)[0]
    if not href or href.startswith(("javascript:", "mailto:", "tel:")):
        return None
    parsed = urlparse(href)
    if parsed.scheme and parsed.scheme not in ("http", "https"):
        return None
    url = urljoin(base, href)
    # biblioteca.afip.gob.ar and arca.gob.ar only serve HTTPS; upgrade any
    # http:// link discovered on index pages (ERR_CONNECTION_RESET otherwise).
    if url.startswith("http://"):
        url = "https://" + url[len("http://"):]
    return url


def extract_discovered_seeds(index_seed: Seed, html: str) -> list[Seed]:
    """Extract allowlisted links from an index page and wrap them as seeds."""
    soup = BeautifulSoup(html, "html.parser")
    seen: set[str] = set()
    discovered: list[Seed] = []

    for anchor in soup.find_all("a", href=True):
        url = _absolute_url(index_seed.url, anchor["href"])
        if not url or url in seen:
            continue
        seen.add(url)
        if not is_allowed(url):
            continue

        text = anchor.get_text(" ", strip=True)
        if _is_nav(url, text):
            continue

        title = text or url.rstrip("/").split("/")[-1] or url
        discovered.append(
            Seed(
                url=url,
                document_type=infer_document_type(url),
                title=title,
                topic=index_seed.topic,
                discovered=True,
                source_seed_url=index_seed.url,
            )
        )
    return discovered
