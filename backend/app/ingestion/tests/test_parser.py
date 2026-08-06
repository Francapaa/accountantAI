# test_parser.py — Tests unitarios del parser HTML/PDF (sin red).
"""Unit tests for the parser (no network)."""

from app.ingestion.parser import parse, parse_html, parse_pdf


def _html(page: str, content: str) -> bytes:
    return (
        "<html><head><title>T</title></head><body>"
        "<nav>Menú</nav>"
        f'<div id="contenido">{content}</div>'
        "<footer>Pie</footer>"
        "</body></html>"
    ).encode("utf-8")


def test_parse_html_extracts_main_content():
    html = _html(
        "page",
        "<h1>Título de la norma</h1><p>Texto del artículo primero.</p><script>var x=1;</script>",
    )
    text = parse_html(html)
    assert "Texto del artículo primero" in text
    assert "Menú" not in text
    assert "Pie" not in text


def test_parse_html_strips_inline_styles_and_scripts():
    html = b"<html><body><style>body{color:red}</style><p>Contenido <b>real</b>.</p></body></html>"
    text = parse_html(html)
    assert "Contenido real." in text
    assert "color:red" not in text


def test_parse_html_empty_page():
    assert parse_html("<html><body></body></html>") == ""


def test_parse_pdf_empty():
    assert parse_pdf(b"") == ""


def test_parse_dispatches_html():
    raw = _html("page", "<p>Hola</p>")
    text = parse(raw, "text/html")
    assert "Hola" in text


def test_parse_dispatches_pdf_empty():
    assert parse(b"", "application/pdf") == ""


def test_parse_html_keeps_content_inside_aspnet_form():
    # biblioteca.afip.gob.ar wraps the whole article in <form id="form1">;
    # the <form> element must NOT be dropped, only its interactive fields.
    html = (
        "<html><body>"
        '<form id="form1">'
        '<input type="hidden" name="VIEWSTATE" value="xyz" />'
        '<div id="contenidoNorma"><h1>RG 5707/2025</h1><p>Libro de IVA Digital.</p></div>'
        "</form>"
        "</body></html>"
    ).encode("utf-8")
    text = parse_html(html)
    assert "RG 5707/2025" in text
    assert "Libro de IVA Digital" in text
    assert "VIEWSTATE" not in text
    assert "xyz" not in text


def test_parse_html_infoleg_resultados_layout():
    # InfoLEG wraps the norm in <div id="resultados"> with no semantic
    # containers; the branding header and footer must be dropped.
    html = (
        "<html><head><meta charset='ISO-8859-1'></head><body>"
        '<header id="branding" role="banner"><div id="encabezado_norma">'
        '<img src="left.png" usemap="#Map" />Infoleg</div></header>'
        '<div id="resultados"><div id="resultados">'
        '<p align="justify">ARTICULO 1º - Interpretación de las leyes impositivas.</p>'
        '<p align="justify">La AFIP ejercerá sus facultades.</p>'
        "</div></div>"
        '<div id="footer"><ul><li>Copyright 2005 Ministerio de Justicia</li></ul></div>'
        "</body></html>"
    ).encode("latin-1")
    text = parse_html(html)
    assert "ARTICULO 1º" in text
    assert "AFIP ejercerá" in text
    assert "Copyright" not in text
    assert "Infoleg" not in text
    assert "branding" not in text
