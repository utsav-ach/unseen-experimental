import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Unseen Nepal account.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Enter your email and password.
        </p>
      </div>
      <LoginForm />
      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </div>
  );
}
