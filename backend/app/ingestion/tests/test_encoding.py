# test_encoding.py — Test de regresión del encoding (latin-1 mal etiquetado como utf-8).
"""Regression: ARCA serves latin-1 bytes mislabeled as utf-8."""

from app.ingestion.parser import parse_html

# "Recategorización ¿cuándo?" encoded as UTF-8 bytes (as the server actually
# sends valid UTF-8). Ensures no U+FFFD leaks into extracted text.
_SNIPPET = "¿Cuándo y cómo me recategorizo?".encode("utf-8")


def test_utf8_bytes_produce_clean_text():
    html = b"<html><body><p>" + _SNIPPET + b"</p></body></html>"
    text = parse_html(html)
    assert "\ufffd" not in text
    assert "¿Cuándo y cómo me recategorizo?" in text
