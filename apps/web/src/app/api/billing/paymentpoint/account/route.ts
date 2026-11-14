import { ApiError, errorResponse } from "@/lib/server/errors";
import { database } from "@/lib/server/database";
import { readJson, requireSameOrigin, stringField } from "@/lib/server/http";
import { requireUser, requireVerifiedEmail } from "@/lib/server/session";
import { createPaymentPointAccounts } from "@/lib/server/paymentpoint";

type StoredAccount = {
  account_number: string;
  account_name: string;
  bank_name: string;
  amount_kobo: number | string | null;
};
type Setup = { status: "creating" | "ready" | "failed" };

function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  const local = compact.startsWith("+234")
    ? `0${compact.slice(4)}`
    : compact.startsWith("234")
      ? `0${compact.slice(3)}`
      : compact;
  if (!/^0[789]\d{9}$/.test(local)) {
    throw new ApiError(
      400,
      "invalid_phone",
      "Enter a valid Nigerian mobile number, such as 08012345678.",
    );
  }
  return local;
}

async function accountsForOwner(ownerId: string): Promise<StoredAccount[]> {
  const sql = database();
  return sql<StoredAccount[]>`
    select account.account_number, account.account_name, account.bank_name, account.amount_kobo
    from paymentpoint_accounts account
    where account.owner_id = ${ownerId}
      and (
        account.amount_kobo is null
        or not exists (
          select 1 from paymentpoint_deposits deposit
          where deposit.account_number = account.account_number
        )
      )
    order by created_at desc
  `;
}

export async function GET() {
  try {
    const user = await requireUser();
    const sql = database();
    const [setups, accounts] = await Promise.all([
      sql<Setup[]>`
        select status from paymentpoint_account_setups where owner_id = ${user.id} limit 1
      `,
      accountsForOwner(user.id),
    ]);
    return Response.json(
      { status: setups[0]?.status ?? "missing", accounts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireUser();
    requireVerifiedEmail(user);
    const body = await readJson(request);
    const phoneNumber = normalizePhone(stringField(body, "phoneNumber", { max: 32 })!);
    const amountNgn = body.amountNgn;
    if (
      typeof amountNgn !== "number" ||
      !Number.isSafeInteger(amountNgn) ||
      amountNgn < 100 ||
      amountNgn > 100_000_000
    ) {
      throw new ApiError(
        400,
        "invalid_amount",
        "Enter a whole-naira top-up amount between ₦100 and ₦100,000,000.",
      );
    }
    const amountKobo = amountNgn * 100;
    const sql = database();

    const claimed = await sql<{ owner_id: string }[]>`
      insert into paymentpoint_account_setups (owner_id, phone_number, status)
      values (${user.id}, ${phoneNumber}, 'creating')
      on conflict (owner_id) do update
        set phone_number = excluded.phone_number, status = 'creating', updated_at = now()
        where paymentpoint_account_setups.status <> 'creating'
          or paymentpoint_account_setups.updated_at < now() - interval '2 minutes'
      returning owner_id
    `;
    if (!claimed[0]) {
      throw new ApiError(
        409,
        "account_setup_in_progress",
        "Your transfer account is being created. Please try again shortly.",
      );
    }

    try {
      const reusableAccounts = await sql<StoredAccount[]>`
        select account.account_number, account.account_name, account.bank_name, account.amount_kobo
        from paymentpoint_accounts account
        where account.owner_id = ${user.id}
          and account.amount_kobo = ${amountKobo}
          and not exists (
            select 1 from paymentpoint_deposits deposit
            where deposit.account_number = account.account_number
          )
        order by created_at desc
        limit 1
      `;
      if (reusableAccounts.length) {
        await sql`
          update paymentpoint_account_setups
          set status = 'ready', updated_at = now()
          where owner_id = ${user.id} and status = 'creating'
        `;
        return Response.json(
          { status: "ready", accounts: await accountsForOwner(user.id) },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      const result = await createPaymentPointAccounts({
        email: user.email,
        name: user.user_metadata.full_name,
        phoneNumber,
        amountNgn,
      });

      const accountRows = result.accounts.map((account) => ({
        account_number: account.accountNumber,
        account_name: account.accountName,
        bank_name: account.bankName,
        reserved_account_id: account.reservedAccountId,
        amount_kobo: amountKobo,
      }));
      const saved = await sql<{ owner_id: string }[]>`
        with provider_accounts as materialized (
          select * from jsonb_to_recordset(${JSON.stringify(accountRows)}::jsonb) as account(
            account_number text,
            account_name text,
            bank_name text,
            reserved_account_id text,
            amount_kobo bigint
          )
        ),
        inserted_accounts as (
          insert into paymentpoint_accounts (
            account_number, owner_id, account_name, bank_name, reserved_account_id, amount_kobo
          )
          select account_number, ${user.id}, account_name, bank_name, reserved_account_id, amount_kobo
          from provider_accounts
          returning account_number
        )
        update paymentpoint_account_setups set customer_id = ${result.customerId},
          status = 'ready', updated_at = now()
        where owner_id = ${user.id}
          and status = 'creating'
          and (select count(*) from inserted_accounts) = (select count(*) from provider_accounts)
        returning owner_id
      `;
      if (!saved.length) {
        throw new ApiError(
          503,
          "account_setup_incomplete",
          "Your transfer account could not be saved. Please try again.",
        );
      }
    } catch (error) {
      await sql`
        update paymentpoint_account_setups set status = 'failed', updated_at = now()
        where owner_id = ${user.id} and status = 'creating'
      `;
      throw error;
    }

    return Response.json(
      { status: "ready", accounts: await accountsForOwner(user.id) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
