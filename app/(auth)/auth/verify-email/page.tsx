import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Check your inbox to finish creating your account.",
};

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent you a verification link. Click it to activate your account,
        then return here to log in.
      </p>
    </div>
  );
}
