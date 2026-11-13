create table paymentpoint_account_setups (
  owner_id uuid primary key references users (id) on delete cascade,
  phone_number text not null,
  customer_id text,
  status text not null check (status in ('creating', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table paymentpoint_accounts (
  account_number text primary key check (account_number ~ '^[0-9]{10}$'),
  owner_id uuid not null references users (id) on delete cascade,
  account_name text not null,
  bank_name text not null,
  reserved_account_id text,
  created_at timestamptz not null default now()
);
create index paymentpoint_accounts_owner_idx on paymentpoint_accounts (owner_id);

create table paymentpoint_deposits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  provider_transaction_id text not null unique,
  account_number text not null references paymentpoint_accounts (account_number),
  amount_kobo bigint not null check (amount_kobo > 0),
  created_at timestamptz not null default now()
);
create index paymentpoint_deposits_owner_created_idx
  on paymentpoint_deposits (owner_id, created_at desc);

create function credit_paymentpoint_deposit(
  p_transaction_id text,
  p_account_number text,
  p_amount_kobo bigint
)
returns boolean language plpgsql as $$
declare
  v_owner_id uuid;
  v_deposit_id uuid;
begin
  select owner_id into v_owner_id
  from paymentpoint_accounts
  where account_number = p_account_number;
  if not found then
    raise exception using errcode = 'P0002', message = 'paymentpoint_account_not_found';
  end if;

  insert into paymentpoint_deposits (
    owner_id, provider_transaction_id, account_number, amount_kobo
  ) values (
    v_owner_id, p_transaction_id, p_account_number, p_amount_kobo
  )
  on conflict (provider_transaction_id) do nothing
  returning id into v_deposit_id;
  if v_deposit_id is null then return false; end if;

  update wallets set balance_kobo = balance_kobo + p_amount_kobo, updated_at = now()
  where owner_id = v_owner_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'wallet_not_found';
  end if;

  insert into wallet_transactions (
    owner_id, amount_kobo, kind, status, external_ref, description
  ) values (
    v_owner_id, p_amount_kobo, 'topup', 'settled',
    'paymentpoint:' || p_transaction_id, 'PaymentPoint wallet deposit'
  );
  insert into audit_logs (owner_id, action, resource_type, resource_id)
  values (v_owner_id, 'wallet.topup_credited', 'paymentpoint_deposit', v_deposit_id);
  return true;
end;
$$;
