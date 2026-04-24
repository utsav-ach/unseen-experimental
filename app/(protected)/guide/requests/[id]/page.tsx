import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide request",
};

export default function GuideRequestPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Request #{params.id}</h1>
      <p className="mt-2 text-muted-foreground">
        Guide-side review + offer submission lands in a follow-up PR. See{" "}
        <code>BookingService.submitGuideOffer</code>.
      </p>
    </section>
  );
}
