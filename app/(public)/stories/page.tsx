import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { storyService } from "@/backend/v2/services/story-services";
import { env } from "@/lib/env";
import { featuredStories } from "@/lib/images";

export const metadata: Metadata = {
  title: "Stories",
  description: "Travel stories from the Unseen Nepal community.",
};

export default async function StoriesPage() {
  const live = env.BACKEND_URL
    ? await storyService.listStories().catch(() => [])
    : [];

  const items =
    live.length > 0
      ? live.map((s) => ({
          id: s.id,
          title: s.title,
          excerpt: s.content.slice(0, 220),
          image: s.feature_image ?? featuredStories[0].image,
          author: s.author.username,
          readMinutes: Math.max(3, Math.round(s.content.length / 900)),
        }))
      : featuredStories;

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container-wide flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-end">
          <div>
            <p className="section-eyebrow">From the trail</p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              Stories
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Raw, unfiltered dispatches from travellers and guides. Lessons
              at altitude, butter-tea epiphanies, and everything in between.
            </p>
          </div>
          <Link
            href="/stories/add"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <PenLine className="size-4" />
            Share a story
          </Link>
        </div>
      </section>

      <section className="container-wide py-16">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stories yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s, idx) => (
              <li key={s.id}>
                <Link href={`/stories/${s.id}`} className="group block">
                  <article className="card-elevated h-full">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={s.image}
                        alt={s.title}
                        fill
                        priority={idx < 2}
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                        {s.readMinutes} min read
                      </p>
                      <h2 className="font-display text-xl font-semibold leading-tight">
                        {s.title}
                      </h2>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {s.excerpt}
                      </p>
                      <p className="pt-2 text-xs text-muted-foreground">
                        by{" "}
                        <span className="font-medium text-foreground">
                          {s.author}
                        </span>
                      </p>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
