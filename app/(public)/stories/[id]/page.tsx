import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { storyService } from "@/backend/v2/services/story-services";
import { env } from "@/lib/env";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!env.BACKEND_URL) return { title: "Story" };
  const s = await storyService.getStory(params.id).catch(() => null);
  if (!s) return { title: "Story" };
  return { title: s.title, description: s.content.slice(0, 160) };
}

export default async function StoryPage({ params }: Props) {
  if (!env.BACKEND_URL) {
    return (
      <article className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Story #{params.id}</h1>
      </article>
    );
  }
  const s = await storyService.getStory(params.id).catch(() => null);
  if (!s) notFound();
  return (
    <article className="container mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{s.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        by {s.author.username}
      </p>
      <div className="prose mt-6 whitespace-pre-wrap text-base">{s.content}</div>
    </article>
  );
}
