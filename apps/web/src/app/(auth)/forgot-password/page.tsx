"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@rektinasub/ui/components/ui/button";
import { Input } from "@rektinasub/ui/components/ui/input";
import { Label } from "@rektinasub/ui/components/ui/label";
import { SmartLink } from "@rektinasub/ui/components/adapters";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const email = new FormData(event.currentTarget).get("email");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error?.message ?? "The request could not be completed.");
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[26rem]">
      <h1 className="text-3xl font-semibold">Reset your password</h1>
      <p className="mt-3 text-muted-foreground">We’ll email you a secure password reset link.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Send reset link"}
        </Button>
      </form>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="mt-6 text-sm">
        <SmartLink href="/sign-in">Back to sign in</SmartLink>
      </p>
    </div>
  );
}
