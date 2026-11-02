import { AuthForm } from "@rektinasub/ui/components/auth-form";
import type { Metadata } from "next";
import { signInPage as page } from "@/config/pages/company";

export const metadata: Metadata = page.meta;

export default function SignInPage() {
  return <AuthForm {...page.form} />;
}
