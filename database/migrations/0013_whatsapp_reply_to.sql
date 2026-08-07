-- 0013: messages.reply_to_message_id
--
-- Links an outbound draft/answer to the inbound message it replies to, so the
-- draft → approve flow can mark the original inbound as `sent` when the reply is
-- dispatched to WhatsApp's client.

alter table public.messages
  add column if not exists reply_to_message_id text;

create index if not exists messages_reply_to_idx
  on public.messages (reply_to_message_id);