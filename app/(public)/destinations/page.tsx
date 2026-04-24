import type { Metadata } from "next";
import Link from "next/link";
import { destinationService } from "@/backend/v2/services/destination-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse featured destinations across Nepal curated by local experts.",
};

export default async function DestinationsPage() {
  const destinations = env.BACKEND_URL
    ? await destinationService
        .listDestinations()
        .catch(() => [] as Awaited<
          ReturnType<typeof destinationService.listDestinations>
        >)
    : [];

  return (
    <section className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Destinations</h1>
        <p className="text-muted-foreground">
          Featured destinations curated by Unseen Nepal admins.
        </p>
      </header>
      {destinations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No destinations yet. Admins will populate this list soon.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <li key={d.id}>
              <Link href={`/destinations/${d.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{d.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {d.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
