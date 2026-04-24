import type { Metadata } from "next";
import Link from "next/link";
import { storyService } from "@/backend/v2/services/story-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Stories",
  description: "Travel stories from the Unseen Nepal community.",
};

export default async function StoriesPage() {
  const stories = env.BACKEND_URL
    ? await storyService.listStories().catch(() => [])
    : [];
  return (
    <section className="container mx-auto py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stories</h1>
          <p className="text-muted-foreground">
            Travel experiences from tourists and guides.
          </p>
        </div>
        <Link
          href="/stories/add"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          Share a story
        </Link>
      </header>
      {stories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stories yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <li key={s.id}>
              <Link href={`/stories/${s.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {s.content}
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
