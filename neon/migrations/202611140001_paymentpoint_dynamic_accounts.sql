alter table paymentpoint_accounts
  add column if not exists amount_kobo bigint
  check (amount_kobo is null or amount_kobo >= 10000);

create or replace function credit_paymentpoint_deposit(
  p_transaction_id text,
  p_account_number text,
  p_amount_kobo bigint
)
returns boolean language plpgsql as $$
declare
  v_owner_id uuid;
  v_expected_amount_kobo bigint;
  v_deposit_id uuid;
begin
  select owner_id, amount_kobo
  into v_owner_id, v_expected_amount_kobo
  from paymentpoint_accounts
  where account_number = p_account_number;
  if not found then
    raise exception using errcode = 'P0002', message = 'paymentpoint_account_not_found';
  end if;
  if v_expected_amount_kobo is not null and v_expected_amount_kobo <> p_amount_kobo then
    raise exception using errcode = 'P0001', message = 'paymentpoint_amount_mismatch';
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
