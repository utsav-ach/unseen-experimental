import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Complete your profile to start using Unseen Nepal.",
};

export default function OnboardingPage() {
  return (
    <section className="container mx-auto max-w-xl py-10">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="mt-2 text-muted-foreground">
        Complete your profile to continue. Form lands in a follow-up PR; the
        contract is <code>complete_onbording</code> RPC in{" "}
        <code>UserService</code>.
      </p>
    </section>
  );
}
