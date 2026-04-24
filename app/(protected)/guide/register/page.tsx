import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply as a guide",
  description: "Start the guide application workflow.",
};

export default function GuideRegisterPage() {
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Apply as a guide</h1>
      <p className="mt-2 text-muted-foreground">
        Multi-step application form lands in a follow-up PR. See{" "}
        <code>application-store</code> and <code>ApplicationService</code>.
      </p>
    </section>
  );
}
