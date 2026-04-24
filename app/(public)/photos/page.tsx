import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { storyService } from "@/backend/v2/services/story-services";
import { env } from "@/lib/env";
import { featuredDestinations, featuredStories } from "@/lib/images";

export const metadata: Metadata = {
  title: "Photos",
  description: "Photos shared by the Unseen Nepal community.",
};

const fallback = [
  ...featuredDestinations.map((d) => ({ id: d.id, url: d.image, alt: d.name })),
  ...featuredStories.map((s) => ({ id: s.id, url: s.image, alt: s.title })),
];

export default async function PhotosPage() {
  const live = env.BACKEND_URL
    ? await storyService.listPhotos().catch(() => [])
    : [];

  const photos =
    live.length > 0
      ? live.map((p) => ({
          id: p.id,
          url: p.image_url,
          alt: p.description ?? "",
        }))
      : fallback;

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container-wide py-16">
          <p className="section-eyebrow">Community gallery</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            Photos
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Snapshots from travellers and guides across the country.
          </p>
        </div>
      </section>
      <section className="container-wide py-16">
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p, idx) => (
              <li key={`${p.id}-${idx}`}>
                <Link
                  href={`/photos/${p.id}`}
                  className="group relative block aspect-square overflow-hidden rounded-[calc(var(--radius)-2px)] border border-border/50"
                >
                  <Image
                    src={p.url}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
