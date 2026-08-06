# 006 — RAG Pipeline

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend

## Purpose

Generate answers to accountant questions backed by official ARCA/AFIP normativa. The assistant
must **always answer with citations** so the accountant can verify before sending it to the client.

## Scope

**In scope:**
- Query embedding.
- Semantic search over `document_chunks` (pgvector).
- Prompt construction (client context + retrieved chunks + instruction).
- Gemini 2.5 answer generation.
- Citation mapping (which chunks were used).

**Out of scope:**
- Ingestion/scraping (see [007-scraper](./007-scraper.md)).
- Nightly re-embedding (see [008](./008-cron-sync.md)).
- History-based retrieval (Phase 2).

## Technical Decisions

| Decision | Choice |
|---|---|
| Query embedding | Google `gemini-embedding-2` with `output_dimensionality=1536` — same model as ingestion |
| Retrieval | `pgvector` HNSW index, cosine similarity |
| Top-K | `k=5` (configurable) |
| Chunk rerank | MVP: none; rely on similarity + prompt instruction |
| Chat model | Gemini 2.5 |
| Context source | Client profile (from [004](./004-clients.md)) + recent history (from [005](./005-chat-conversation.md)) |
| Fallback | If no chunk is relevant (below score threshold) → answer "not in our knowledge base" + suggest contacting AFIP. Do NOT hallucinate normativa. |

## Pipeline (per query)

```
1. embed(query) → query_vector
2. SELECT document_id, content, embedding_model
   FROM document_chunks
   WHERE embedding_model = ACTIVE_MODEL
   ORDER BY embedding <=> query_vector
   LIMIT k
   -- only chunks whose document.is_active = true
3. Build prompt:
   - System: "You are an accountant assistant. Answer in Spanish (AR). Cite the normativa you use.
     Never invent legal references. If the evidence is insufficient, say so."
   - Client context: profile fields (name, province, tax_regime, activity).
   - Recent history: last N messages (if any).
   - Retrieved chunks: {document_type, title, source_url, excerpt}
   - User question.
4. Call Gemini 2.5 → answer.
5. Map used chunks → citations [{document_id, title, source_url, quoted_excerpt}].
6. Return {reply, citations}; persist via chat flow ([005](./005-chat-conversation.md)).
```

## Prompt Guardrails

1. Cite only normativa present in the retrieved chunks.
2. If the answer depends on a document, include its title + source_url.
3. If evidence is insufficient or ambiguous, clearly say so instead of guessing.
4. Answers are pre-send drafts for the accountant to verify; the tool never auto-sends to clients.

## Citation Shape

```json
[
  {
    "document_id": "uuid",
    "title": "Monotributo — Recategorización",
    "document_type": "Instructivo",
    "source_url": "https://www.arca.gob.ar/...",
    "quoted_excerpt": "La recategorización se realiza...",
    "chunk_index": 4
  }
]
```

## Workflows

**Given** a user question, **when** retrieval returns relevant chunks above threshold, **then**
Gemini answers with at least one citation to a retrieved document.

**Given** a user question, **when** no chunk is relevant, **then** the assistant responds that the
information is not in the knowledge base and suggests official channels, without citing anything.

**Given** a client profile exists, **when** the prompt is built, **then** the profile context is
included so the answer respects regime/province/activity.

## Acceptance Criteria

1. Query is embedded with the active embedding model and searched in pgvector.
2. Only chunks from `is_active` documents with the active `embedding_model` are candidates.
3. Every answer that uses normativa includes at least one citation (title + source_url).
4. Answers respect client persistent context.
5. Insufficient-evidence cases produce an explicit "not found / insufficient" answer — never fabricated legal references.
6. The RAG result is returned as `{ reply, citations }` and persisted by the chat flow.

## Open Questions

- Similarity threshold value — TBD via testing; start with a configurable constant.
- Chunk overlap and size — see [007](./007-scraper.md).
- Reranking (e.g. cross-encoder) — future if precision is insufficient.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | RAG pipeline spec created: embed → pgvector search → Gemini → citations. |