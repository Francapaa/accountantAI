# prompt.py — Construcción del prompt para la generación RAG.
"""Prompt construction for RAG answer generation (SDD 006).

Builds the chat messages passed to Gemini: a system instruction with the
accountant-assistant guardrails, the client persistent context, the recent
conversation history, and the user question together with the retrieved chunks
— the only legal basis the model may cite.
"""

from google.genai import types

from app.rag.models import RetrievedChunk

SYSTEM_PROMPT = (
    "Eres un asistente de contabilidad especializado en normativa AFIP/ARCA de Argentina. "
    "Respondés en español rioplatense (es-AR), de forma clara, profesional y precisa.\n\n"
    "Reglas obligatorias:\n"
    "1. Citá ÚNICAMENTE la normativa que aparezca en los DOCUMENTOS RECUPERADOS. "
    "Nunca inventes leyes, artículos, plazos, resoluciones ni URLs fuera de ahí.\n"
    "2. Cuando tu respuesta dependa de un documento, incluí su título y su URL de origen "
    "para que el contador pueda verificarlo.\n"
    "3. Si la evidencia es insuficiente o ambigua, decilo explícitamente en lugar de adivinar.\n"
    "4. Adaptá la respuesta al CONTEXTO DEL CLIENTE (provincia, régimen tributario, actividad) "
    "cuando sea pertinente.\n"
    "5. Tus respuestas son borradores que el contador revisará antes de enviar: ante la duda, "
    "preferí ser conservador y sugerir la consulta directa a AFIP/ARCA."
    "6. Usa las normativas MAS RECIENTES. Estamos en Agosto de 2026."
)


def build_system_prompt() -> str:
    return SYSTEM_PROMPT


def _render_context(client_context: dict[str, str] | None) -> str:
    if not client_context:
        return ""
    lines = [
        f"- {name}: {value}"
        for name, value in client_context.items()
        if value not in (None, "")
    ]
    return "CONTEXTO DEL CLIENTE\n" + "\n".join(lines) if lines else ""


def _render_history(history: list[dict] | None) -> str:
    if not history:
        return ""
    lines = []
    for item in history:
        role = "Usuario" if item.get("role") == "user" else "Asistente"
        lines.append(f"{role}: {item.get('content', '')}")
    return "HISTORIAL RECIENTE\n" + "\n".join(lines)


def _render_chunks(chunks: list[RetrievedChunk]) -> str:
    lines = ["DOCUMENTOS RECUPERADOS"]
    if not chunks:
        lines.append("(no se recuperó normativa relevante)")
    for index, chunk in enumerate(chunks, start=1):
        lines.append(f"[{index}] Título: {chunk.title}")
        if chunk.document_type:
            lines.append(f"    Tipo: {chunk.document_type}")
        if chunk.source_url:
            lines.append(f"    Fuente: {chunk.source_url}")
        lines.append(f"    Contenido: {chunk.content}")
    return "\n".join(lines)


def build_messages(
    question: str,
    chunks: list[RetrievedChunk],
    client_context: dict[str, str] | None = None,
    history: list[dict] | None = None,
) -> list[types.Content]:
    """Build the chat messages sent to Gemini.

    `client_context` is a flat dict of profile fields (e.g. province,
    tax_regime, activity). `history` is a list of ``{"role", "content"}``
    dicts, oldest first; each becomes its own turn on chat (assistant turns
    as ``model``). `chunks` is the retrieval result and the only admissible
    legal basis. `system` is provided separately via the generation config.
    """
    messages: list[types.Content] = []

    for item in history or []:
        role = "model" if item.get("role") == "assistant" else "user"
        messages.append(
            types.Content(role=role, parts=[types.Part(text=str(item.get("content", "")))])
        )

    sections = [
        section
        for section in (
            _render_context(client_context),
            _render_history(history),
            _render_chunks(chunks),
        )
        if section
    ]
    user_text = "\n\n".join(sections + [f"CONSULTA ESPECÍFICA\n{question}"]) if sections else question

    messages.append(types.Content(role="user", parts=[types.Part(text=user_text)]))
    return messages