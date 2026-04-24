import type { Metadata } from "next";
import { destinationService } from "@/backend/v2/services/destination-services";
import { DestinationCard } from "@/components/featured/destination-card";
import { env } from "@/lib/env";
import { featuredDestinations } from "@/lib/images";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse featured destinations across Nepal curated by local experts.",
};

export default async function DestinationsPage() {
  const live = env.BACKEND_URL
    ? await destinationService
        .listDestinations()
        .catch(() => [] as Awaited<
          ReturnType<typeof destinationService.listDestinations>
        >)
    : [];

  const items =
    live.length > 0
      ? live.map((d) => ({
          id: d.id,
          name: d.name,
          region: d.coordinates
            ? `${d.coordinates.latitude.toFixed(2)}, ${d.coordinates.longitude.toFixed(2)}`
            : "Nepal",
          description: d.description,
          image: d.feature_image ?? featuredDestinations[0].image,
          tags: d.tags.slice(0, 3),
          rating: d.avg_rating,
          days: "Flexible",
        }))
      : featuredDestinations;

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container-wide py-16">
          <p className="section-eyebrow">Nepal, mapped by locals</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Destinations
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Hand-picked regions and trailheads, each paired with guides who
            know them intimately. Every listing is visitable with Unseen from
            tomorrow.
          </p>
        </div>
      </section>
      <section className="container-wide py-16">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No destinations yet. Admins will populate this list soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d, idx) => (
              <DestinationCard
                key={d.id}
                item={d}
                href={`/destinations/${d.id}`}
                priority={idx < 3}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
