create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);

create index projects_owner_created_idx on public.projects (owner_id, created_at);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  key_prefix text not null,
  key_hash text not null unique,
  daily_limit integer not null default 20 check (daily_limit between 1 and 1000),
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (project_id, owner_id) references public.projects (id, owner_id) on delete cascade
);

create index api_keys_project_created_idx on public.api_keys (project_id, created_at desc);

create table public.wallets (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  currency text not null default 'NGN' check (currency = 'NGN'),
  balance_kobo bigint not null default 0 check (balance_kobo >= 0),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  amount_kobo bigint not null check (amount_kobo <> 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  kind text not null check (kind in ('topup', 'email_reservation', 'email_refund')),
  status text not null check (status in ('pending', 'settled', 'refunded', 'unknown')),
  external_ref text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create index wallet_transactions_owner_created_idx
  on public.wallet_transactions (owner_id, created_at desc);

create table public.topups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  reference text not null unique,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'pending' check (status in ('pending', 'credited', 'failed')),
  provider_transaction_id text unique,
  authorization_url text,
  created_at timestamptz not null default now(),
  credited_at timestamptz
);

create index topups_owner_created_idx on public.topups (owner_id, created_at desc);

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null,
  api_key_id uuid not null references public.api_keys (id) on delete restrict,
  idempotency_key text not null,
  request_hash text not null,
  sender text not null,
  recipient text not null,
  subject text not null,
  text_body text,
  html_body text,
  status text not null default 'processing'
    check (status in ('processing', 'sent', 'failed', 'unknown')),
  provider_message_id text,
  failure_reason text,
  amount_kobo bigint not null check (amount_kobo > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, owner_id) references public.projects (id, owner_id) on delete cascade,
  unique (project_id, idempotency_key)
);

create index email_messages_owner_created_idx
  on public.email_messages (owner_id, created_at desc);
create index email_messages_key_created_idx
  on public.email_messages (api_key_id, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  created_at timestamptz not null default now()
);

create index audit_logs_owner_created_idx on public.audit_logs (owner_id, created_at desc);

create or replace function public.create_default_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  insert into public.wallets (owner_id) values (new.id);

  insert into public.projects (owner_id, name) values (new.id, 'Default project');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_default_account();

create or replace function public.reserve_email_send(
  p_owner_id uuid,
  p_project_id uuid,
  p_api_key_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_sender text,
  p_recipient text,
  p_subject text,
  p_text_body text,
  p_html_body text,
  p_amount_kobo bigint
)
returns table (message_id uuid, message_status text, is_duplicate boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.email_messages%rowtype;
  v_key public.api_keys%rowtype;
  v_wallet public.wallets%rowtype;
  v_recent_count integer;
  v_message_id uuid;
begin
  select * into v_existing
  from public.email_messages
  where project_id = p_project_id and idempotency_key = p_idempotency_key;

  if found then
    if v_existing.request_hash <> p_request_hash then
      raise exception using errcode = '22023', message = 'idempotency_conflict';
    end if;
    return query select v_existing.id, v_existing.status, true;
    return;
  end if;

  select * into v_key
  from public.api_keys
  where id = p_api_key_id
    and project_id = p_project_id
    and owner_id = p_owner_id
    and revoked_at is null
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'api_key_revoked';
  end if;

  select count(*) into v_recent_count
  from public.email_messages
  where api_key_id = p_api_key_id
    and created_at > now() - interval '24 hours';

  if v_recent_count >= v_key.daily_limit then
    raise exception using errcode = 'P0001', message = 'daily_limit_exceeded';
  end if;

  select * into v_wallet
  from public.wallets
  where owner_id = p_owner_id
  for update;

  if not found or v_wallet.balance_kobo < p_amount_kobo then
    raise exception using errcode = 'P0001', message = 'insufficient_balance';
  end if;

  insert into public.email_messages (
    owner_id, project_id, api_key_id, idempotency_key, request_hash,
    sender, recipient, subject, text_body, html_body, amount_kobo
  ) values (
    p_owner_id, p_project_id, p_api_key_id, p_idempotency_key, p_request_hash,
    p_sender, p_recipient, p_subject, p_text_body, p_html_body, p_amount_kobo
  )
  returning id into v_message_id;

  update public.wallets
  set balance_kobo = balance_kobo - p_amount_kobo, updated_at = now()
  where owner_id = p_owner_id;

  insert into public.wallet_transactions (
    owner_id, amount_kobo, kind, status, external_ref, description
  ) values (
    p_owner_id, -p_amount_kobo, 'email_reservation', 'pending',
    'email:' || v_message_id::text, 'Email send reservation'
  );

  insert into public.audit_logs (owner_id, action, resource_type, resource_id)
  values (p_owner_id, 'email.send_reserved', 'email_message', v_message_id);

  return query select v_message_id, 'processing'::text, false;
end;
$$;

create or replace function public.finish_email_send(
  p_owner_id uuid,
  p_message_id uuid,
  p_status text,
  p_provider_message_id text default null,
  p_failure_reason text default null
)
returns table (message_id uuid, message_status text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_message public.email_messages%rowtype;
begin
  if p_status not in ('sent', 'failed', 'unknown') then
    raise exception using errcode = '22023', message = 'invalid_message_status';
  end if;

  select * into v_message
  from public.email_messages
  where id = p_message_id and owner_id = p_owner_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'message_not_found';
  end if;

  if v_message.status <> 'processing' then
    return query select v_message.id, v_message.status;
    return;
  end if;

  update public.email_messages
  set status = p_status,
      provider_message_id = p_provider_message_id,
      failure_reason = left(p_failure_reason, 500),
      updated_at = now()
  where id = p_message_id;

  if p_status = 'sent' then
    update public.wallet_transactions
    set status = 'settled'
    where external_ref = 'email:' || p_message_id::text;
  elsif p_status = 'failed' then
    update public.wallets
    set balance_kobo = balance_kobo + v_message.amount_kobo, updated_at = now()
    where owner_id = p_owner_id;

    update public.wallet_transactions
    set status = 'refunded'
    where external_ref = 'email:' || p_message_id::text;

    insert into public.wallet_transactions (
      owner_id, amount_kobo, kind, status, external_ref, description
    ) values (
      p_owner_id, v_message.amount_kobo, 'email_refund', 'settled',
      'email-refund:' || p_message_id::text, 'Refund for failed email send'
    )
    on conflict (external_ref) do nothing;
  else
    update public.wallet_transactions
    set status = 'unknown'
    where external_ref = 'email:' || p_message_id::text;
  end if;

  insert into public.audit_logs (owner_id, action, resource_type, resource_id)
  values (p_owner_id, 'email.send_' || p_status, 'email_message', p_message_id);

  return query select p_message_id, p_status;
end;
$$;

create or replace function public.credit_paystack_topup(
  p_reference text,
  p_provider_transaction_id text,
  p_amount_kobo bigint
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_topup public.topups%rowtype;
begin
  select * into v_topup
  from public.topups
  where reference = p_reference
  for update;

  if not found or v_topup.amount_kobo <> p_amount_kobo or v_topup.currency <> 'NGN' then
    raise exception using errcode = '22023', message = 'topup_amount_mismatch';
  end if;

  if v_topup.status = 'credited' then
    return false;
  end if;

  if v_topup.status <> 'pending' then
    raise exception using errcode = '22023', message = 'topup_not_pending';
  end if;

  update public.wallets
  set balance_kobo = balance_kobo + p_amount_kobo, updated_at = now()
  where owner_id = v_topup.owner_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'wallet_not_found';
  end if;

  insert into public.wallet_transactions (
    owner_id, amount_kobo, kind, status, external_ref, description
  ) values (
    v_topup.owner_id, p_amount_kobo, 'topup', 'settled',
    'paystack:' || p_reference, 'Paystack wallet top-up'
  );

  update public.topups
  set status = 'credited',
      provider_transaction_id = p_provider_transaction_id,
      credited_at = now()
  where id = v_topup.id;

  insert into public.audit_logs (owner_id, action, resource_type, resource_id)
  values (v_topup.owner_id, 'wallet.topup_credited', 'topup', v_topup.id);

  return true;
end;
$$;

revoke all on function public.reserve_email_send(uuid, uuid, uuid, text, text, text, text, text, text, text, bigint) from public;
revoke all on function public.finish_email_send(uuid, uuid, text, text, text) from public;
revoke all on function public.credit_paystack_topup(text, text, bigint) from public;
grant execute on function public.reserve_email_send(uuid, uuid, uuid, text, text, text, text, text, text, text, bigint) to service_role;
grant execute on function public.finish_email_send(uuid, uuid, text, text, text) to service_role;
grant execute on function public.credit_paystack_topup(text, text, bigint) to service_role;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.api_keys enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.topups enable row level security;
alter table public.email_messages enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their profile"
  on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Users can update their profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Users can read their projects"
  on public.projects for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users can read their API key metadata"
  on public.api_keys for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users can read their wallet"
  on public.wallets for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users can read their wallet transactions"
  on public.wallet_transactions for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users can read their top-ups"
  on public.topups for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users can read their email logs"
  on public.email_messages for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users can read their audit logs"
  on public.audit_logs for select to authenticated using (owner_id = (select auth.uid()));
