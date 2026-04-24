import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Unseen Nepal account.",
};

export default function LoginPage() {
  return (
    <div className="w-full space-y-8">
      <div>
        <p className="section-eyebrow">Welcome back</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">
          Log in to Unseen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and password to continue.
        </p>
      </div>
      <LoginForm />
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
