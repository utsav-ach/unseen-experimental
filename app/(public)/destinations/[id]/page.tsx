import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, MapPin } from "lucide-react";
import { destinationService } from "@/backend/v2/services/destination-services";
import { env } from "@/lib/env";
import { featuredDestinations } from "@/lib/images";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fallback = featuredDestinations.find((d) => d.id === params.id);
  if (fallback) {
    return { title: fallback.name, description: fallback.description };
  }
  if (!env.BACKEND_URL) return { title: "Destination" };
  const d = await destinationService.getDestination(params.id).catch(() => null);
  if (!d) return { title: "Destination" };
  return { title: d.name, description: d.description };
}

export default async function DestinationDetailPage({ params }: Props) {
  const fallback = featuredDestinations.find((d) => d.id === params.id);

  const destination = env.BACKEND_URL
    ? await destinationService
        .getDestination(params.id)
        .catch(() => null)
    : null;

  const data =
    destination ??
    (fallback
      ? {
          id: fallback.id,
          name: fallback.name,
          description: fallback.description,
          feature_image: fallback.image,
          tags: fallback.tags,
          avg_rating: fallback.rating,
          coordinates: null,
          additional_images: [] as string[],
        }
      : null);

  if (!data) notFound();

  const reviews =
    destination && env.BACKEND_URL
      ? await destinationService.listReviews(data.id).catch(() => [])
      : [];

  return (
    <article>
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={data.feature_image ?? featuredDestinations[0].image}
          alt={data.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="container-wide absolute inset-x-0 bottom-0 pb-12 text-white">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to destinations
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-balance sm:text-6xl">
                {data.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/85">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-white text-white" />
                  {Number(data.avg_rating ?? 0).toFixed(2)}
                </span>
                {data.coordinates && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" />
                    {data.coordinates.latitude.toFixed(3)},{" "}
                    {data.coordinates.longitude.toFixed(3)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide grid gap-12 py-16 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="section-eyebrow">About this destination</p>
          <p className="mt-4 prose-legible">{data.description}</p>
          {data.additional_images.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.additional_images.slice(0, 6).map((img) => (
                <div
                  key={img}
                  className="relative aspect-square overflow-hidden rounded-[calc(var(--radius)-2px)]"
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-elevated p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Plan your trip
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us dates and group size, and we&apos;ll match you with
              guides who service this destination.
            </p>
            <Link
              href={`/destinations/map?target=${data.id}`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Find guides here
            </Link>
            <Link
              href="/packages"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              See ready-to-book packages
            </Link>
          </div>
        </aside>
      </div>

      <section className="border-t border-border/60 bg-secondary/30">
        <div className="container-wide py-16">
          <h2 className="font-display text-3xl font-semibold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No reviews yet. Be the first to travel and share your story.
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.id} className="card-elevated p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {r.reviewer_username ?? "Anonymous"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="size-4 fill-accent text-accent" />
                      {r.rating.toFixed(1)}
                    </span>
                  </div>
                  {r.review_text && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {r.review_text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </article>
  );
}
