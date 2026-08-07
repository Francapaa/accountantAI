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
- AI-generated draft replies (no RAG yet): the "draft" the accountant approves is authored by the accountant in the app.

## Multi-tenancy

The platform is used by many accountants. Model: **one platform Meta App + one platform
WABA (Model A)** shared by all accountants. Global secrets (`WHATSAPP_ACCESS_TOKEN`,
`WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_BUSINESS_ACCOUNT_ID`) live in
the backend `.env`. Each accountant links their own number in `whatsapp_connections`
(`waba_id`, `phone_number_id`, `phone_number`); inbound events are routed to the owner via
`metadata.phone_number_id`.

This avoids storing per-account secrets and the webhook chicken-and-egg problem (the
`X-Hub-Signature-256` must be verified with the app secret of the App that received the
event — a single shared App keeps one secret).

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
│   ├── service.py       # routing (phone_number_id → owner) + persistence + dedup
│   └── schemas.py       # ProviderInboundMessage / ProviderOutboundPayload / MediaInput / TemplateRef
├── api/
│   └── whatsapp.py      # /api/whatsapp/connections + /api/whatsapp/messages (authenticated)
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

### Storage impact (mirrored in [009](./009-database-schema.md) + migration `0012`)

- `whatsapp_connections` — per account: `waba_id`, `phone_number_id`, `phone_number`,
  `status`, `provider`. RLS owner-only.
- `clients.phone` — E.164-ish number of the client's WhatsApp, used to match inbound
  `wa_id` → workspace.
- `messages` gains `provider`, `provider_message_id` (partial unique index → dedup),
  `direction` (`inbound`/`outbound`) and `status` (`received`/`draft`/`sent`/`failed`).

The adapter persists normalized messages; the stored domain model remains the author of
record.

## API (backend)

- `GET  /api/whatsapp/webhook`  — challenge (subscription verification for Meta).
- `POST /api/whatsapp/webhook`    — inbound events (HMAC signature verified, deduped, routed to owner by `phone_number_id`, persisted).
- `GET  /api/whatsapp/connections`        — list the accountant's WhatsApp connections.
- `POST /api/whatsapp/connections`        — link a number (`waba_id`, `phone`, `phone_number_id`).
- `DELETE /api/whatsapp/connections/{id}` — unlink a number.
- `POST /api/whatsapp/messages`  — approve & send a reply to a client (uses the accountant's `phone_number_id`).

The webhook is public (unauthenticated) but signature/token verified; connection/send endpoints are authenticated (Supabase JWT). All webhook signatures validated on the raw body.

### Settings (new vars in `.env`)

```
WHATSAPP_VERIFY_TOKEN=...       # global — you choose; used in webhook GET challenge
WHATSAPP_ACCESS_TOKEN=...       # global — system-user token with access to the platform WABA
WHATSAPP_APP_SECRET=...         # global — Meta App secret, for X-Hub-Signature-256
WHATSAPP_BUSINESS_ACCOUNT_ID=...  # global — platform WABA id
WHATSAPP_PHONE_NUMBER_ID=...      # global default/test number; accountants link their own later
```

## Workflows (given / when / then)

**Given** Meta sends a GET challenge with `hub.verify_token` and `hub.challenge`,
**when** The token matches `WHATSAPP_VERIFY_TOKEN`,
**then** The challenge is echoed back and the webhook subscription is confirmed.

**Given** Meta sends an inbound message (POST, valid HMAC signature),
**when** it reaches the endpoint,
**then** `metadata.phone_number_id` maps the message to the owning `whatsapp_connections`
accountant; `wa_id` maps to a client (`clients.phone`), creating a placeholder workspace if
unknown; the message is persisted (`direction='inbound'`, `status='received'`) with dedup on
`provider_message_id` and forwarded to the approval flow.

**Given** the accountant approves a draft for a client,
**when** the backend calls the provider (`POST /api/whatsapp/messages`),
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
3. An inbound message is routed to its owner via `phone_number_id`, matched to a client by
   phone, persisted (`direction='inbound'`, `status='received'`) and does not duplicate on retry.
4. Within the window, replies use free-form; outside, a template reference is used.
5. An accountant can link/unlink a number (`whatsapp_connections`) and list their connections.
6. A send (`POST /api/whatsapp/messages`) persists the Meta `provider_message_id` as `sent`.
7. The core depends on `IWhatsAppProvider`, not the Meta library.

## Open Questions

- Approval channel to the accountant (WhatsApp-to-accountant vs email) — product decision.
- Media download / audio transcription — Phase 2.
- Unknown sender handling: currently a placeholder client is created named with the phone;
  auto-grouping/suggested assignment — product decision.

## Changelog

| Date | Change |
|---|---|
| 2026-08-07 | Multi-tenant Model A (shared platform App/WABA, per-account `whatsapp_connections`); webhook routes by `phone_number_id`, matches `clients.phone`, persists with dedup; connection endpoints (`GET/POST/DELETE`) + send endpoint; migration `0012`. |
| 2026-08-05 | Spec created: `IWhatsAppProvider` + Meta Cloud API (direct, no BSP) transport, HMAC-verified webhook, 24h window handling, idempotent ingestion. |