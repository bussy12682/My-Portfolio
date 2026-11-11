"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SmartLink } from "@rektinasub/ui/components/adapters";
import { Button } from "@rektinasub/ui/components/ui/button";
import { Input } from "@rektinasub/ui/components/ui/input";
import { Label } from "@rektinasub/ui/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    const confirmation = form.get("confirmation");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: new URLSearchParams(window.location.search).get("token"),
          password,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error?.message ?? "The request could not be completed.");
      setMessage("Your password has been updated.");
      router.replace(result.redirectTo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[26rem]">
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      <p className="mt-3 text-muted-foreground">Use at least 12 characters.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmation">Confirm new password</Label>
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Update password"}
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
