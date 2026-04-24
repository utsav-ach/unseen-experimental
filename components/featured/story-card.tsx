import Image from "next/image";
import Link from "next/link";
import type { FeaturedStory } from "@/lib/images";

export function StoryCard({ story }: { story: FeaturedStory }) {
  return (
    <Link href={`/stories/${story.id}`} className="group block">
      <article className="card-elevated h-full">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={story.image}
            alt={story.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-3 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            {story.readMinutes} min read
          </p>
          <h3 className="font-display text-xl font-semibold leading-tight">
            {story.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {story.excerpt}
          </p>
          <p className="pt-2 text-xs text-muted-foreground">
            by{" "}
            <span className="font-medium text-foreground">{story.author}</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
