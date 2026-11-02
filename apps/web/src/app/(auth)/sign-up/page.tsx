import { AuthForm } from "@rektinasub/ui/components/auth-form";
import type { Metadata } from "next";
import { signUpPage as page } from "@/config/pages/company";

export const metadata: Metadata = page.meta;

export default function SignUpPage() {
  return <AuthForm {...page.form} />;
}
