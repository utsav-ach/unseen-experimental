import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinationService } from "@/backend/v2/services/destination-services";
import { env } from "@/lib/env";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!env.BACKEND_URL) return { title: "Destination" };
  const d = await destinationService.getDestination(params.id).catch(() => null);
  if (!d) return { title: "Destination" };
  return { title: d.name, description: d.description };
}

export default async function DestinationDetailPage({ params }: Props) {
  if (!env.BACKEND_URL) {
    return (
      <section className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Destination #{params.id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Supabase is not configured. This page will render destination data
          once credentials are set.
        </p>
      </section>
    );
  }
  const [destination, reviews] = await Promise.all([
    destinationService.getDestination(params.id).catch(() => null),
    destinationService.listReviews(params.id).catch(() => []),
  ]);
  if (!destination) notFound();

  return (
    <article className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{destination.name}</h1>
        <p className="mt-2 text-muted-foreground">{destination.description}</p>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {r.reviewer_username ?? "Anonymous"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {r.rating.toFixed(1)} / 5
                  </span>
                </div>
                {r.review_text && (
                  <p className="mt-2 text-sm">{r.review_text}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
