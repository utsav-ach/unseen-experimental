import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a new Unseen Nepal account.",
};

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sign up</h1>
        <p className="text-sm text-muted-foreground">
          Create an account to book guides and share stories.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
