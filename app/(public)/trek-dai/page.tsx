import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trek Dai",
  description: "Guide-led trek pairing section.",
};

export default function TrekDaiPage() {
  return (
    <section className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Trek Dai</h1>
      <p className="mt-2 text-muted-foreground">
        Curated treks paired with their lead guides. Content lands in a follow-up PR.
      </p>
    </section>
  );
}
