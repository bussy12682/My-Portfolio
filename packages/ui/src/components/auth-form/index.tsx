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
  /** Short helper under the field. */
  hint?: string;
};

export type AuthFormProps = {
  title: string;
  description?: string;
  fields: AuthField[];
  submitLabel: string;
  /** Shown after submit while there is no backend, so the form never pretends to work. */
  pendingMessage: string;
  /** e.g. "Don't have an account?" + Sign up. */
  switchPrompt?: { text: string; link: LinkItem };
  /** Small print under the button, e.g. the terms line. */
  footnote?: string;
  className?: string;
};

/**
 * A sign-in / sign-up panel: 32px title, 48px fields, a full-width 48px primary button. UI only:
 * submitting validates the fields and shows `pendingMessage` instead of calling a backend.
 */
export function AuthForm({
  title,
  description,
  fields,
  submitLabel,
  pendingMessage,
  switchPrompt,
  footnote,
  className,
}: AuthFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
              required
              className="h-12 rounded-md bg-card px-3.5 text-base md:text-base dark:bg-card"
            />
            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
          </div>
        ))}
        <Button type="submit" size="lg" className="mt-2 h-12 w-full">
          {submitLabel}
        </Button>
        {submitted && (
          <p
            role="status"
            className="flex gap-2.5 border border-orbital/30 bg-orbital/10 px-4 py-3 text-sm leading-5 text-foreground/90"
          >
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-orbital" />
            {pendingMessage}
          </p>
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
