import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { storyService } from "@/backend/v2/services/story-services";
import { env } from "@/lib/env";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!env.BACKEND_URL) return { title: "Photo" };
  const p = await storyService.getPhoto(params.id).catch(() => null);
  if (!p) return { title: "Photo" };
  return { title: p.description ?? "Photo", description: p.description ?? undefined };
}

export default async function PhotoPage({ params }: Props) {
  if (!env.BACKEND_URL) {
    return (
      <section className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Photo #{params.id}</h1>
      </section>
    );
  }
  const photo = await storyService.getPhoto(params.id).catch(() => null);
  if (!photo) notFound();
  return (
    <article className="container mx-auto max-w-3xl py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.image_url}
        alt={photo.description ?? ""}
        className="w-full rounded-md border border-border"
      />
      {photo.description && <p className="mt-4 text-base">{photo.description}</p>}
      <p className="mt-2 text-sm text-muted-foreground">
        by {photo.uploader.username}
      </p>
    </article>
  );
}
