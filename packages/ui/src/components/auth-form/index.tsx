"use client";

import { SmartLink } from "@rektinasub/ui/components/adapters";
import { Button } from "@rektinasub/ui/components/ui/button";
import { Input } from "@rektinasub/ui/components/ui/input";
import { Label } from "@rektinasub/ui/components/ui/label";
import { typeScale } from "@rektinasub/ui/components/typography";
import type { LinkItem } from "@rektinasub/ui/lib/links";
import { cn } from "cn";
import { InfoIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

export type AuthField = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel";
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  /** Short helper under the field. */
  hint?: string;
};

export type AuthFormProps = {
  title: string;
  description?: string;
  fields: AuthField[];
  submitLabel: string;
  apiEndpoint: string;
  /** e.g. "Don't have an account?" + Sign up. */
  switchPrompt?: { text: string; link: LinkItem };
  /** Small print under the button, e.g. the terms line. */
  footnote?: string;
  passwordResetHref?: string;
  verificationResendHref?: string;
  className?: string;
};

/**
 * A sign-in / sign-up panel with consistent field sizing and JSON API submission.
 */
export function AuthForm({
  title,
  description,
  fields,
  submitLabel,
  apiEndpoint,
  switchPrompt,
  footnote,
  passwordResetHref,
  verificationResendHref,
  className,
}: AuthFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");
    setIsError(false);
    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMessage =
          result &&
          typeof result === "object" &&
          "error" in result &&
          result.error &&
          typeof result.error === "object" &&
          "message" in result.error &&
          typeof result.error.message === "string"
            ? result.error.message
            : "Your request could not be completed. Please try again.";
        throw new Error(errorMessage);
      }

      if (
        result &&
        typeof result === "object" &&
        "confirmationRequired" in result &&
        result.confirmationRequired === true &&
        "message" in result &&
        typeof result.message === "string"
      ) {
        setMessage(result.message);
        return;
      }

      if (
        result &&
        typeof result === "object" &&
        "redirectTo" in result &&
        typeof result.redirectTo === "string" &&
        result.redirectTo.startsWith("/")
      ) {
        window.location.assign(result.redirectTo);
        return;
      }
      throw new Error("The account service returned an unexpected response. Please try again.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The account service could not be reached. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("w-full max-w-[26rem]", className)}>
      <h1 className={typeScale.heading}>{title}</h1>
      {description && <p className={cn(typeScale.body, "mt-3")}>{description}</p>}
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate={false}>
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              minLength={field.minLength}
              required
              className="h-12 rounded-md bg-card px-3.5 text-base md:text-base dark:bg-card"
            />
            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
          </div>
        ))}
        <Button type="submit" size="lg" className="mt-2 h-12 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Please wait…" : submitLabel}
        </Button>
        {message && (
          <p
            role={isError ? "alert" : "status"}
            className="flex gap-2.5 border border-orbital/30 bg-orbital/10 px-4 py-3 text-sm leading-5 text-foreground/90"
          >
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-orbital" />
            {message}
          </p>
        )}
        {passwordResetHref && (
          <SmartLink
            href={passwordResetHref}
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Forgot your password?
          </SmartLink>
        )}
        {verificationResendHref && (
          <SmartLink
            href={verificationResendHref}
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Resend verification email
          </SmartLink>
        )}
      </form>
      {footnote && <p className="mt-5 text-xs leading-5 text-muted-foreground">{footnote}</p>}
      {switchPrompt && (
        <p className="mt-8 border-t pt-6 text-sm text-muted-foreground">
          {switchPrompt.text}{" "}
          <SmartLink
            href={switchPrompt.link.href}
            className="font-semibold text-foreground underline decoration-1 underline-offset-4 hover:decoration-orbital"
          >
            {switchPrompt.link.label}
          </SmartLink>
        </p>
      )}
    </div>
  );
}
