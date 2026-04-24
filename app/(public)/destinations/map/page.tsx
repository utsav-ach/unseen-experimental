import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations map",
  description:
    "Pick a location on the map to discover destinations and guides nearby.",
};

export default function DestinationsMapPage() {
  return (
    <section className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Destinations map</h1>
      <p className="mt-2 text-muted-foreground">
        Interactive map view lands in a follow-up PR. The{" "}
        <code>SelectionMap</code> component under <code>components/map/</code>{" "}
        is the starting point.
      </p>
    </section>
  );
}
