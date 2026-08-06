# test_loader_discovery.py — Tests de loader, descubrimiento y helpers de storage (sin red).
"""Unit tests for discovery and storage helpers (no network)."""

from app.ingestion.discovery import extract_discovered_seeds
from app.ingestion.loader import infer_document_type, is_allowed, load_seeds
from app.ingestion.models import Seed
from app.ingestion.storage import storage_path_for


def _index_html(links: list[str]) -> str:
    anchors = "\n".join(f'<a href="{u}">{t}</a>' for u, t in links)
    return f"<html><body>{anchors}</body></html>"


def test_extract_keeps_only_allowlisted():
    html = _index_html(
        [
            ("https://biblioteca.afip.gob.ar/dcp/REAG01005417_2023_09_15", "RG 5417"),
            ("https://www.afip.gob.ar/monotributo/ayuda/guias.asp", "Guías"),
            ("https://www.google.com/", "Google"),
        ]
    )
    seed = Seed(
        url="https://www.afip.gob.ar/monotributo/ayuda/normativa.asp",
        document_type="Manual",
        title="x",
        index=True,
        discovery=True,
    )
    found = extract_discovered_seeds(seed, html)
    urls = {d.url for d in found}
    assert "https://biblioteca.afip.gob.ar/dcp/REAG01005417_2023_09_15" in urls
    assert "https://www.google.com/" not in urls


def test_extract_skips_nav_links():
    html = _index_html(
        [
            ("https://www.afip.gob.ar/monotributo/ayuda/contacto.asp", "Contacto"),
            ("https://www.afip.gob.ar/monotributo/ayuda/normativa.asp", "Normativa"),
        ]
    )
    seed = Seed(
        url="https://www.afip.gob.ar/monotributo/ayuda/normativa.asp",
        document_type="Manual",
        title="x",
        index=True,
        discovery=True,
    )
    assert extract_discovered_seeds(seed, html) == []


def test_extract_dedupes_and_uses_absolute_urls():
    html = _index_html(
        [
            ("/monotributo/ayuda/", "Ayuda"),
            ("https://www.afip.gob.ar/monotributo/ayuda/", "Ayuda"),
        ]
    )
    seed = Seed(
        url="https://www.afip.gob.ar/monotributo/ayuda/normativa.asp",
        document_type="Manual",
        title="x",
        index=True,
        discovery=True,
    )
    found = extract_discovered_seeds(seed, html)
    assert len(found) == 1


def test_extract_upgrades_http_to_https():
    html = _index_html(
        [
            ("http://biblioteca.afip.gob.ar/dcp/REAG01005417_2023_09_15", "RG 5417"),
        ]
    )
    seed = Seed(
        url="https://www.afip.gob.ar/monotributo/ayuda/normativa.asp",
        document_type="Manual",
        title="x",
        index=True,
        discovery=True,
    )
    found = extract_discovered_seeds(seed, html)
    assert len(found) == 1
    assert found[0].url.startswith("https://")


def test_extract_keeps_search_query_norma_links():
    html = _index_html(
        [
            (
                "https://biblioteca.afip.gob.ar/search/query/norma.aspx?p=t:RAG%7Cn:5637%7Co:9%7Ca:2025%7Cf:17/01/2025",
                "RG 5637/2025",
            ),
            ("https://biblioteca.afip.gob.ar/search/query/dcp/LEY_C_024977_1998_06_03", "Ley 24.977"),
        ]
    )
    seed = Seed(
        url="https://www.afip.gob.ar/monotributo/ayuda/normativa.asp",
        document_type="Manual",
        title="x",
        index=True,
        discovery=True,
    )
    found = extract_discovered_seeds(seed, html)
    urls = {d.url for d in found}
    assert len(found) == 2
    assert any("norma.aspx" in u for u in urls)
    assert any("search/query/dcp/" in u for u in urls)
    types = {d.document_type for d in found}
    assert "Resolución" in types
    assert "Ley" in types


def test_infer_document_type():
    assert infer_document_type("https://biblioteca.afip.gob.ar/dcp/LEY_C_020628_2019_12_05") == "Ley"
    assert infer_document_type("https://biblioteca.afip.gob.ar/dcp/REAG01005417_2023_09_15") == "Resolución"
    assert infer_document_type("https://www.afip.gob.ar/monotributo/ayuda/") == "Manual"


def test_infer_document_type_search_query():
    assert (
        infer_document_type(
            "https://biblioteca.afip.gob.ar/search/query/norma.aspx?p=t:RAG%7Cn:5637%7Co:9%7Ca:2025%7Cf:17/01/2025"
        )
        == "Resolución"
    )
    assert (
        infer_document_type(
            "https://biblioteca.arca.gob.ar/search/query/norma.aspx?p=t:RAG%7Cn:5671%7Co:9%7Ca:2025%7Cf:09/04/2025"
        )
        == "Resolución"
    )
    assert (
        infer_document_type(
            "https://biblioteca.afip.gob.ar/search/query/dcp/LEY_C_024977_1998_06_03"
        )
        == "Ley"
    )


def test_is_allowed():
    assert is_allowed("https://biblioteca.afip.gob.ar/dcp/DEC_C_000661_2024_07_23")
    assert is_allowed("https://www.arca.gob.ar/monotributo/ayuda/recategorizacion.asp")
    assert is_allowed(
        "https://biblioteca.afip.gob.ar/search/query/norma.aspx?p=t:RAG%7Cn:5637%7Co:9%7Ca:2025%7Cf:17/01/2025"
    )
    assert is_allowed(
        "https://biblioteca.afip.gob.ar/search/query/dcp/LEY_C_024977_1998_06_03"
    )
    assert not is_allowed("https://www.arca.gob.ar/monotributo/default.asp")
    assert not is_allowed("https://www.boletinoficial.gob.ar/detalleAviso/primera/1/20240101")


def test_storage_path_is_deterministic():
    url = "https://www.arca.gob.ar/monotributo/ayuda/recategorizacion.asp"
    p1 = storage_path_for(url, "text/html", "monotributo")
    p2 = storage_path_for(url, "text/html", "monotributo")
    assert p1 == p2
    assert p1.endswith(".html")
    assert p1.startswith("monotributo/")
    p3 = storage_path_for(url, "application/pdf", "monotributo")
    assert p3.endswith(".pdf")


def test_load_seeds_yaml_well_formed():
    seeds = load_seeds()
    assert seeds
    assert all(s.topic for s in seeds)
    for s in seeds:
        assert s.url.startswith("http")
        assert s.document_type in ("FAQ", "Resolución", "Manual", "Ley", "Instructivo")
