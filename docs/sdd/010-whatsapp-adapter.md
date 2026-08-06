# 010 — WhatsApp Adapter (Meta Cloud API)

> Status: Accepted · Last updated: 2026-08-05 · Owner: backend

## Purpose

Connect AccountantAI to WhatsApp so an accountant can communicate with clients from their own
phone while the product keeps information organized per client. The transport is isolated behind a
**provider abstraction** (`IWhatsAppProvider`) so the core does not depend on a concrete library
and can migrate (e.g. to a controlled Baileys pilot) without rewriting the chat.

## Scope

**In scope:**
- `IWhatsAppProvider` abstraction with a **Meta Cloud API** implementation (direct, no BSP).
- Meta webhook: GET challenge verification + POST inbound event ingestion.
- HMAC `X-Hub-Signature-256` signature verification.
- Free-form replies (inside the 24h window) and template sends (outside the window).
- Normalized `ProviderInboundMessage` / `ProviderOutboundPayload` contracts.
- 24h conversation-window awareness and idempotent ingestion.
- Router wiring, connection settings, and repository layout.

**Out of scope:**
- RAG / approval flow (see [006](./006-rag-pipeline.md), [005](./005-chat-conversation.md)).
- Accountant approval channel (email or WhatsApp-to-accountant) — later phase.
- Audio transcription and media download — Phase 2.
- Per-message cost / billing metrics — Phase 3.
- Unofficial (Baileys) provider — documented for a controlled pilot only, not implemented.

## Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Abstraction | `IWhatsAppProvider` with `send_message` + `send_template` | Core depends on a small interface, not a library; provider is swappable |
| Official transport | **Meta Cloud API (direct, no BSP)** | No platform fee; inbound/within-window replies are free-form and free |
| Receive | **Meta Graph/Cloud API webhook** | Standard HTTPS endpoint with verify token + HMAC signature |
| Verify | Verify token echo + `X-Hub-Signature-256` HMAC-SHA256 | Confirms the request originated from Meta |
| 24h window | Per-`wa_id` conversation window | Decides free-form (free) vs template (billable) |
| Idempotency | Dedup on `provider_message_id` | Prevents duplicates on Meta retries |
| Number | Dedicated phone number per account/WABA | Cannot already be registered on another WhatsApp account |
| Secrets | Env vars / secrets manager | Never in the repository |

## Repository

```
backend/app/
├── whatsapp/
│   ├── __init__.py
│   ├── provider.py      # IWhatsAppProvider (Protocol)
│   ├── meta.py          # MetaCloudApiProvider
│   ├── webhook.py       # FastAPI router: GET challenge + POST events
│   └── schemas.py       # ProviderInboundMessage / ProviderOutboundPayload / MediaInput / TemplateRef
└── core/
    └── config.py        # + whatsapp_* settings
```

## Provider abstraction

```python
class IWhatsAppProvider(Protocol):
    def send_message(
        self,
        *,
        to: str,                     # E.164, e.g. +5491130000115
        text: str,
        reply_to_id: str | None = None,
        template: TemplateRef | None = None,
        media: MediaInput | None = None,
    ) -> str: ...                    # returns provider_message_id
```

Two strategies:

- **`send_message` (free-form)** — replies within the open 24h window. Free.
- **`template`** — outside the window or when the business initiates the conversation (e.g. first
  contact). Requires an approved Meta template and is billable.

### MetaCloudApiProvider

- Sends via `POST https://graph.facebook.com/v21.0/{phone_number_id}/messages`.
- `Authorization: Bearer <access_token>`.
- Media: uploaded to Meta (`/messages/media`) first, then referenced by returned `id`.
- Returns `messages[0].id` as the `provider_message_id`.

## Data Model

### Contracts (normalized, transport-agnostic)

```
class ProviderInboundMessage:
    provider: str                  # "meta"
    provider_message_id: str       # wamid.xxx — used for dedup
    wa_id: str                     # normalized E.164 of the sender (no @)
    from: str                      # the account's WhatsApp number receiving it
    timestamp: datetime
    text: str | None
    media: MediaInfo | None        # type, id, mime, url
    reply_to_id: str | None        # quoted/replied-to message id

class ProviderOutboundPayload:
    to: str
    text: str | None
    media: MediaInput | None
    template: TemplateRef | None
    reply_to_id: str | None
```

### Storage impact (to be mirrored in [009](./009-database-schema.md))

- `whatsapp_connections` — per account: `waba_id`, `phone_number_id`, secrets reference, provider.
- `messages` gains `provider` and `provider_message_id` (unique per account) for idempotency.
- Optional `conversation_windows` (per account/wa_id) caching open/closed 24h state.

The adapter persists normalized messages; the stored domain model in **it** remains the author of
record.

## API (backend)

- `GET  /api/whatsapp/webhook`  — challenge (subscription verification for Meta).
- `POST /api/whatsapp/webhook`    — inbound events (HMAC signature verified).
- `POST /api/whatsapp/messages`  — internal/authenticated; called by the approval flow to send.

The webhook is public (unauthenticated) but signature/token verified; sending is internal
(service auth). All webhook signatures validated on the raw body.

### Settings (new vars in `.env`)

```
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_APP_SECRET=...          # for X-Hub-Signature-256
```

## Workflows (given / when / then)

**Given** Meta sends a GET challenge with `hub.verify_token` and `hub.challenge`,
**when** The token matches `WHATSAPP_VERIFY_TOKEN`,
**then** The challenge is echoed back and the webhook subscription is confirmed.

**Given** Meta sends an inbound message (POST, valid HMAC signature),
**when** it reaches the endpoint,
**then** it is normalized to `ProviderInboundMessage`, mapped to a client/conversation, persisted
(dedup on `provider_message_id`) and forwarded to the chat/RAG pipeline.

**Given** the accountant approves a draft for a client,
**when** the backend calls the provider,
**then** the 24h window is evaluated:
- open → `send_message` (free-form, free);
- closed → template (approved template required).

**Given** Meta re-delivers the same message (retry),
**when** the adapter processes it,
**then** it is detected by `provider_message_id` and no duplicate is created.

**Given** an outbound send, **when** it is persisted, **then** the provider `message_id` and
state are stored so delivered/read acknowledgements can update the transport state.

## Acceptance Criteria

1. A webhook subscribes successfully after a verification GET (challenge echo).
2. POSTs are validated by `X-Hub-Signature-256`; invalid requests are rejected.
3. An inbound message normalizes to `ProviderInboundMessage`, is persisted, and does not
   duplicate on retry.
4. Within the window, replies use free-form; outside, a template reference is used.
5. A send receives and persists the Meta `provider_message_id`.
6. The core depends on `IWhatsAppProvider`, not the Meta library.

## Open Questions

- Approval channel to the accountant (WhatsApp-to-accountant vs email) — product decision.
- Media download / audio transcription — Phase 2.
- Dedicated number: new number vs re-registering the accountant's existing number (affects
  existing history) — product decision.

## Changelog

| Date | Change |
|---|---|
| 2026-08-05 | Spec created: `IWhatsAppProvider` + Meta Cloud API (direct, no BSP) transport, HMAC-verified webhook, 24h window handling, idempotent ingestion. |