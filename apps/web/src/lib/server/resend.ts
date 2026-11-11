import { resendApiKey, resendFromEmail, resendFromName } from "./env";
import { ApiError } from "./errors";

type ResendResult = { id: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  idempotencyKey?: string;
}) {
  const from = `${resendFromName()
    .replace(/[\r\n]/g, "")
    .slice(0, 100)} <${resendFromEmail()}>`;
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendApiKey()}`,
        "content-type": "application/json",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        ...(input.html ? { html: input.html } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ApiError(
      503,
      "email_delivery_unknown",
      "The email provider did not return a response.",
    );
  }

  const result = (await response.json().catch(() => null)) as
    (ResendResult & { message?: string; name?: string }) | null;
  if (!response.ok) {
    console.error("Resend request failed", { status: response.status, name: result?.name });
    if (response.status >= 500) {
      throw new ApiError(
        503,
        "email_delivery_unknown",
        "The email provider could not confirm the delivery request.",
      );
    }
    throw new ApiError(502, "email_provider_rejected", "The email provider rejected the request.");
  }
  if (!result?.id) {
    throw new ApiError(
      503,
      "email_delivery_unknown",
      "The email provider returned an invalid response.",
    );
  }
  return { id: result.id };
}
