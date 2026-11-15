alter table wallet_transactions
  drop constraint if exists wallet_transactions_kind_check,
  add constraint wallet_transactions_kind_check
    check (kind in (
      'topup',
      'email_reservation',
      'email_refund',
      'vtu_reservation',
      'vtu_refund',
      'sms_reservation',
      'sms_refund'
    ));

create table if not exists sms_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  project_id uuid not null,
  api_key_id uuid not null references api_keys (id) on delete restrict,
  idempotency_key text not null,
  request_hash text not null,
  sender_id text not null,
  recipient_count integer not null check (recipient_count between 1 and 50),
  pages_per_recipient integer not null check (pages_per_recipient between 1 and 3),
  status text not null default 'processing'
    check (status in ('processing', 'accepted', 'failed', 'unknown')),
  provider_request_id text,
  failure_reason text,
  amount_kobo bigint not null check (amount_kobo > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, owner_id) references projects (id, owner_id) on delete cascade,
  unique (project_id, idempotency_key)
);
create index if not exists sms_messages_owner_created_idx on sms_messages (owner_id, created_at desc);
create index if not exists sms_messages_key_created_idx on sms_messages (api_key_id, created_at desc);

create or replace function reserve_sms_send(
  p_owner_id uuid,
  p_project_id uuid,
  p_api_key_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_sender_id text,
  p_recipient_count integer,
  p_pages_per_recipient integer,
  p_amount_kobo bigint
)
returns table (message_id uuid, message_status text, is_duplicate boolean)
language plpgsql as $$
declare
  v_existing sms_messages%rowtype;
  v_key api_keys%rowtype;
  v_balance bigint;
  v_message_id uuid;
begin
  select * into v_key from api_keys
  where id = p_api_key_id and project_id = p_project_id
    and owner_id = p_owner_id and revoked_at is null
  for update;
  if not found then raise exception using errcode = '42501', message = 'api_key_revoked'; end if;

  select * into v_existing from sms_messages
  where project_id = p_project_id and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_hash <> p_request_hash then
      raise exception using errcode = '22023', message = 'idempotency_conflict';
    end if;
    return query select v_existing.id, v_existing.status, true;
    return;
  end if;

  if (select count(*) from sms_messages
      where api_key_id = p_api_key_id and created_at > now() - interval '24 hours') >= v_key.daily_limit then
    raise exception using errcode = 'P0001', message = 'daily_limit_exceeded';
  end if;

  select balance_kobo into v_balance from wallets where owner_id = p_owner_id for update;
  if not found or v_balance < p_amount_kobo then
    raise exception using errcode = 'P0001', message = 'insufficient_balance';
  end if;

  insert into sms_messages (
    owner_id, project_id, api_key_id, idempotency_key, request_hash,
    sender_id, recipient_count, pages_per_recipient, amount_kobo
  ) values (
    p_owner_id, p_project_id, p_api_key_id, p_idempotency_key, p_request_hash,
    p_sender_id, p_recipient_count, p_pages_per_recipient, p_amount_kobo
  ) returning id into v_message_id;

  update wallets set balance_kobo = balance_kobo - p_amount_kobo, updated_at = now()
  where owner_id = p_owner_id;
  insert into wallet_transactions (owner_id, amount_kobo, kind, status, external_ref, description)
  values (p_owner_id, -p_amount_kobo, 'sms_reservation', 'pending',
    'sms:' || v_message_id::text, 'Bulk SMS send reservation');
  insert into audit_logs (owner_id, action, resource_type, resource_id)
  values (p_owner_id, 'sms.send_reserved', 'sms_message', v_message_id);
  return query select v_message_id, 'processing'::text, false;
end;
$$;

create or replace function finish_sms_send(
  p_owner_id uuid,
  p_message_id uuid,
  p_status text,
  p_provider_request_id text default null,
  p_failure_reason text default null
)
returns table (message_id uuid, message_status text)
language plpgsql as $$
declare
  v_message sms_messages%rowtype;
begin
  if p_status not in ('accepted', 'failed', 'unknown') then
    raise exception using errcode = '22023', message = 'invalid_sms_status';
  end if;
  select * into v_message from sms_messages
  where id = p_message_id and owner_id = p_owner_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'sms_message_not_found'; end if;
  if v_message.status <> 'processing' then
    return query select v_message.id, v_message.status;
    return;
  end if;

  update sms_messages set status = p_status, provider_request_id = p_provider_request_id,
    failure_reason = left(p_failure_reason, 500), updated_at = now()
  where id = p_message_id;
  if p_status = 'accepted' then
    update wallet_transactions set status = 'settled' where external_ref = 'sms:' || p_message_id::text;
  elsif p_status = 'failed' then
    update wallets set balance_kobo = balance_kobo + v_message.amount_kobo, updated_at = now()
    where owner_id = p_owner_id;
    update wallet_transactions set status = 'refunded' where external_ref = 'sms:' || p_message_id::text;
    insert into wallet_transactions (owner_id, amount_kobo, kind, status, external_ref, description)
    values (p_owner_id, v_message.amount_kobo, 'sms_refund', 'settled',
      'sms-refund:' || p_message_id::text, 'Refund for rejected SMS send')
    on conflict (external_ref) do nothing;
  else
    update wallet_transactions set status = 'unknown' where external_ref = 'sms:' || p_message_id::text;
  end if;
  insert into audit_logs (owner_id, action, resource_type, resource_id)
  values (p_owner_id, 'sms.send_' || p_status, 'sms_message', p_message_id);
  return query select p_message_id, p_status;
end;
$$;
