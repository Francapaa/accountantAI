# loader.py — Lee seed_urls.yaml (seeds curadas por tema) y las allowlists de descubrimiento.
"""Load curated seeds and discovery allowlists from seed_urls.yaml."""

import yaml
from pathlib import Path
from urllib.parse import urlparse

from app.ingestion.models import Seed

SEED_URLS_PATH = Path(__file__).resolve().parent / "config" / "seed_urls.yaml"


def load_seeds(path: Path | str | None = None) -> list[Seed]:
    """Read seed_urls.yaml (grouped by topic) and flatten into Seed objects."""
    src = Path(path) if path else SEED_URLS_PATH
    with src.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)

    seeds: list[Seed] = []
    for topic in data.get("topics", []):
        name = topic.get("name", "")
        for raw in topic.get("seeds", []):
            seed = Seed(
                url=raw["url"],
                document_type=raw["document_type"],
                title=raw["title"],
                topic=name,
                index=bool(raw.get("index", False)),
                discovery=bool(raw.get("discovery", False)),
            )
            if seed.index and not seed.discovery:
                raise ValueError(
                    f"Seed {seed.url} is index=true but discovery=false; "
                    "index pages must be discovery sources."
                )
            seeds.append(seed)
    return seeds


def is_allowed(url: str) -> bool:
    """Discovery allowlist: Electrónica Library details + ARCA help + InfoLEG."""
    return is_biblioteca_detail(url) or is_arca_help(url) or is_infoleg(url)


def is_biblioteca_detail(url: str) -> bool:
    """Electrónica Library norm pages on either host.

    ARCA links norms in two shapes:
      - direct:  biblioteca.afip.gob.ar/dcp/REAG01004309_2018_09_17
      - recent:  biblioteca.afip.gob.ar/search/query/norma.aspx?p=t:RAG|n:5803|...
      - legacy:  biblioteca.afip.gob.ar/search/query/dcp/LEY_C_024977_1998_06_03
    All of them render the full norm text.
    """
    if "biblioteca.afip.gob.ar/" in url or "biblioteca.arca.gob.ar/" in url:
        if "/dcp/" in url:
            return True
        if "search/query/norma.aspx" in url:
            return True
        if "search/query/dcp/" in url:
            return True
    return False


def is_arca_help(url: str) -> bool:
    """ARCA/AFIP help pages: host is arca/afip and path contains /ayuda/."""
    host_ok = any(h in url for h in ("arca.gob.ar", "afip.gob.ar"))
    return host_ok and "/ayuda/" in url


def is_infoleg(url: str) -> bool:
    """InfoLEG norm pages on either host (static texact.htm or dynamic verNorma.do)."""
    if not any(h in url for h in ("infoleg.gob.ar", "servicios.infoleg.gob.ar")):
        return False
    path = urlparse(url).path
    return "texact.htm" in path or "verNorma.do" in path


def infer_document_type(url: str) -> str:
    """Infer document_type from the URL (used for discovered seeds)."""
    if is_infoleg(url):
        # InfoLEG hosts national laws, decrees and joint resolutions; without a
        # norm code in the URL we default to the most common case (ley).
        return "Ley"
    if is_biblioteca_detail(url):
        tipo = _biblioteca_tipo(url)
        if tipo == "LEY":
            return "Ley"
        if tipo == "DEC":
            # enum lacks Decreto; see docs/sdd/007 open questions
            return "Ley"
        if tipo in ("RAG", "RES", "DIS", "AUD"):
            return "Resolución"
        if tipo == "CIR":
            return "Manual"
        return "Resolución"
    return "Manual"


def _biblioteca_tipo(url: str) -> str:
    """Extract the norm type code from a biblioteca URL.

    Prefers the p=t:CODE parameter of search/query URLs (RAG, LEY, DEC, ...),
    falls back to the slug prefix of /dcp/ URLs (REAG..., LEY..., ...).
    """
    from urllib.parse import parse_qs, urlparse

    query = parse_qs(urlparse(url).query)
    p = query.get("p", [""])[0]
    if p and p.startswith("t:"):
        return p[2:].split("|")[0].upper()
    if "/dcp/" in url:
        slug = url.split("/dcp/")[-1].upper()
        if slug.startswith(("LEY_", "TOR_")):
            return "LEY"
        if slug.startswith("DEC_"):
            return "DEC"
        if slug.startswith(("REA", "RES", "DIS", "AUD")):
            return "RAG"
        if slug.startswith("CIR_"):
            return "CIR"
    return ""
