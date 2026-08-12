begin;

create table if not exists public.whatsapp_webhook_messages (
  provider_message_id text primary key,
  sender_id text not null,
  provider_timestamp text,
  message_type text not null,
  has_text boolean not null default false,
  received_at timestamptz not null default now(),
  constraint whatsapp_webhook_message_id_length
    check (length(provider_message_id) between 1 and 200),
  constraint whatsapp_webhook_sender_id_length
    check (length(sender_id) between 1 and 200),
  constraint whatsapp_webhook_message_type_length
    check (length(message_type) between 1 and 50)
);

create index if not exists whatsapp_webhook_messages_received_at_idx
on public.whatsapp_webhook_messages (received_at desc);

alter table public.whatsapp_webhook_messages enable row level security;

-- The Data API roles receive no direct access and no RLS policy. Only the
-- trusted server-side service role can perform durable deduplication.
revoke all on table public.whatsapp_webhook_messages
from public, anon, authenticated;

grant select, insert on table public.whatsapp_webhook_messages to service_role;

commit;
