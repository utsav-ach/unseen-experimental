import type { Metadata } from "next";
import Link from "next/link";
import { destinationService } from "@/backend/v2/services/destination-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Travel packages",
  description: "Pre-planned trips with fixed prices. Book directly, no negotiation.",
};

export default async function PackagesPage() {
  const packages = env.BACKEND_URL
    ? await Promise.all([
        destinationService.listDestinationPackages().catch(() => []),
        destinationService.listActivityPackages().catch(() => []),
      ]).then(([a, b]) => [...a, ...b])
    : [];
  return (
    <section className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Travel packages</h1>
        <p className="text-muted-foreground">
          Curated trips with fixed pricing, ready to book.
        </p>
      </header>
      {packages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No packages yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <li key={p.id}>
              <Link href={`/packages/details/${p.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      NPR {p.discounted_price ?? p.actual_price}
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
