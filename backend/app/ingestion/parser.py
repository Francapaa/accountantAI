# parser.py — Convierte HTML (BeautifulSoup) y PDF (pypdf) en texto limpio y normalizado.
"""Parse raw sources (HTML/PDF) into clean text.

HTML is parsed with BeautifulSoup using a readability-style heuristic that
prefers the main content container and strips boilerplate. PDFs use pypdf.
"""

import io
import re

from bs4 import BeautifulSoup
from pypdf import PdfReader

_TAGS_TO_DROP = (
    "script",
    "style",
    "noscript",
    "nav",
    "footer",
    "header",
    "aside",
    "iframe",
    "svg",
    "button",
    "meta",
    # interactive fields (their labels/values pollute the text); the <form>
    # element itself is NOT dropped because ASP.NET pages (biblioteca.afip)
    # wrap the whole article content inside <form id="form1">.
    "input",
    "select",
    "textarea",
    "label",
)

_MAIN_SELECTORS = (
    "main",
    "article",
    ".info.container",
    '[id*="contenido" i]',
    '[class*="contenido" i]',
    '[id*="content" i]',
    '[class*="content" i]',
    '[class*="texto" i]',
    '[id*="texto" i]',
    # InfoLEG wraps the norm text in #resultados (no semantic containers).
    "#resultados",
)

_WS_RE = re.compile(r"[ \t\u00a0]+")
_MULTILINE_RE = re.compile(r"\n{3,}")


def _pick_main(soup: BeautifulSoup) -> BeautifulSoup | None:
    candidates: list[tuple[int, BeautifulSoup]] = []
    seen: set[int] = set()
    for selector in _MAIN_SELECTORS:
        for el in soup.select(selector):
            key = id(el)
            if key in seen:
                continue
            seen.add(key)
            candidates.append((len(el.get_text(" ", strip=True)), el))
    if not candidates:
        return soup.body or soup
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def _clean_text(raw: str) -> str:
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    # keep paragraph breaks (blank lines) but fold inline newlines into spaces
    text = text.replace("\n\n", "\x00")
    text = text.replace("\n", " ")
    text = text.replace("\x00", "\n\n")
    text = re.sub(r"[ \t\u00a0]+", " ", text)
    text = re.sub(r"\s+([.,;:!?%])", r"\1", text)
    text = _MULTILINE_RE.sub("\n\n", text)
    return text.strip()


def _to_unicode(data: bytes | str) -> str:
    """Decode HTML bytes tolerantly.

    ARCA pages declare charset=utf-8 but their bytes are actually latin-1.
    BeautifulSoup would trust the declared charset and produce U+FFFD, so we
    sniff: prefer utf-8, fall back to latin-1 when it fails or yields
    replacement characters.
    """
    if isinstance(data, str):
        return data
    for encoding in ("utf-8", "latin-1"):
        try:
            text = data.decode(encoding)
            if "\ufffd" not in text:
                return text
        except UnicodeDecodeError:
            continue
    return data.decode("latin-1", errors="replace")


def parse_html(html: bytes | str) -> str:
    soup = BeautifulSoup(_to_unicode(html), "html.parser")
    for tag in soup(_TAGS_TO_DROP):
        tag.decompose()

    main = _pick_main(soup)
    return _clean_text(main.get_text("\n"))


def parse_pdf(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception:
        return ""
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            parts.append(text)
    return _clean_text("\n".join(parts))


def parse(raw: bytes, content_type: str) -> str:
    """Dispatch to the right parser based on the source MIME type."""
    if content_type == "application/pdf":
        return parse_pdf(raw)
    return parse_html(raw)
