alter table wallet_transactions
  drop constraint wallet_transactions_kind_check,
  add constraint wallet_transactions_kind_check
    check (kind in ('topup', 'email_reservation', 'email_refund', 'vtu_reservation', 'vtu_refund'));

create table vtu_orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  provider text not null check (provider = 'telecom_abode'),
  service text not null check (service in ('airtime', 'data')),
  provider_product_id text not null,
  product_label text not null,
  recipient text not null,
  amount_kobo bigint not null check (amount_kobo > 0),
  idempotency_key_hash text not null,
  request_hash text not null,
  status text not null default 'processing'
    check (status in ('processing', 'successful', 'failed', 'unknown')),
  provider_message text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, idempotency_key_hash)
);
create index vtu_orders_owner_created_idx on vtu_orders (owner_id, created_at desc);
create index vtu_orders_status_created_idx on vtu_orders (status, created_at);

create function reserve_vtu_purchase(
  p_owner_id uuid,
  p_provider text,
  p_service text,
  p_provider_product_id text,
  p_product_label text,
  p_recipient text,
  p_amount_kobo bigint,
  p_idempotency_key_hash text,
  p_request_hash text
)
returns table (order_id uuid, order_status text, is_duplicate boolean, error_code text)
language plpgsql as $$
declare
  v_existing vtu_orders%rowtype;
  v_balance bigint;
  v_order_id uuid;
begin
  perform pg_advisory_xact_lock(
    hashtextextended(p_owner_id::text || ':' || p_idempotency_key_hash, 0)
  );

  select * into v_existing
  from vtu_orders
  where owner_id = p_owner_id and idempotency_key_hash = p_idempotency_key_hash
  for update;

  if found then
    if v_existing.request_hash <> p_request_hash then
      return query select null::uuid, null::text, false, 'idempotency_conflict'::text;
      return;
    end if;
    return query select v_existing.id, v_existing.status, true, null::text;
    return;
  end if;

  select balance_kobo into v_balance
  from wallets where owner_id = p_owner_id for update;
  if not found or v_balance < p_amount_kobo then
    return query select null::uuid, null::text, false, 'insufficient_balance'::text;
    return;
  end if;

  insert into vtu_orders (
    owner_id, provider, service, provider_product_id, product_label,
    recipient, amount_kobo, idempotency_key_hash, request_hash
  ) values (
    p_owner_id, p_provider, p_service, p_provider_product_id, p_product_label,
    p_recipient, p_amount_kobo, p_idempotency_key_hash, p_request_hash
  ) returning id into v_order_id;

  update wallets set balance_kobo = balance_kobo - p_amount_kobo, updated_at = now()
  where owner_id = p_owner_id;

  insert into wallet_transactions (
    owner_id, amount_kobo, kind, status, external_ref, description
  ) values (
    p_owner_id, -p_amount_kobo, 'vtu_reservation', 'pending',
    'vtu:' || v_order_id::text, 'VTU purchase reservation'
  );

  insert into audit_logs (owner_id, action, resource_type, resource_id)
  values (p_owner_id, 'vtu.purchase_reserved', 'vtu_order', v_order_id);

  return query select v_order_id, 'processing'::text, false, null::text;
end;
$$;

create function finish_vtu_purchase(
  p_owner_id uuid,
  p_order_id uuid,
  p_status text,
  p_provider_message text default null,
  p_failure_reason text default null
)
returns table (order_id uuid, order_status text)
language plpgsql as $$
declare
  v_order vtu_orders%rowtype;
begin
  if p_status not in ('successful', 'failed', 'unknown') then
    raise exception using errcode = '22023', message = 'invalid_vtu_status';
  end if;

  select * into v_order from vtu_orders
  where id = p_order_id and owner_id = p_owner_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'vtu_order_not_found';
  end if;

  if v_order.status in ('successful', 'failed') then
    return query select v_order.id, v_order.status;
    return;
  end if;

  update vtu_orders
  set status = p_status,
      provider_message = left(p_provider_message, 500),
      failure_reason = left(p_failure_reason, 200),
      updated_at = now()
  where id = p_order_id;

  if p_status = 'successful' then
    update wallet_transactions set status = 'settled'
    where external_ref = 'vtu:' || p_order_id::text;
  elsif p_status = 'failed' then
    update wallets set balance_kobo = balance_kobo + v_order.amount_kobo, updated_at = now()
    where owner_id = p_owner_id;
    update wallet_transactions set status = 'refunded'
    where external_ref = 'vtu:' || p_order_id::text;
    insert into wallet_transactions (
      owner_id, amount_kobo, kind, status, external_ref, description
    ) values (
      p_owner_id, v_order.amount_kobo, 'vtu_refund', 'settled',
      'vtu-refund:' || p_order_id::text, 'Refund for failed VTU purchase'
    ) on conflict (external_ref) do nothing;
  else
    update wallet_transactions set status = 'unknown'
    where external_ref = 'vtu:' || p_order_id::text;
  end if;

  insert into audit_logs (owner_id, action, resource_type, resource_id)
  values (p_owner_id, 'vtu.purchase_' || p_status, 'vtu_order', p_order_id);

  return query select p_order_id, p_status;
end;
$$;
