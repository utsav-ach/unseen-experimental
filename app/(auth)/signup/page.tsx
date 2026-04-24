import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a new Unseen Nepal account.",
};

export default function SignupPage() {
  return (
    <div className="w-full space-y-8">
      <div>
        <p className="section-eyebrow">Start your journey</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Book verified guides, plan trips, and save itineraries.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
