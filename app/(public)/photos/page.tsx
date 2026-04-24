import type { Metadata } from "next";
import Link from "next/link";
import { storyService } from "@/backend/v2/services/story-services";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Photos",
  description: "Photos shared by the Unseen Nepal community.",
};

export default async function PhotosPage() {
  const photos = env.BACKEND_URL
    ? await storyService.listPhotos().catch(() => [])
    : [];
  return (
    <section className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Photos</h1>
        <p className="text-muted-foreground">
          Photos from across Nepal, shared by the community.
        </p>
      </header>
      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/photos/${p.id}`}
                className="block overflow-hidden rounded-md border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={p.description ?? ""}
                  className="aspect-square w-full object-cover"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
