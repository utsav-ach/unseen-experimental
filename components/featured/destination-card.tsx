import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { FeaturedItem } from "@/lib/images";

export function DestinationCard({
  item,
  href,
  priority = false,
}: {
  item: FeaturedItem;
  href?: string;
  priority?: boolean;
}) {
  const content = (
    <article className="card-elevated group relative h-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          <Star className="size-3 fill-accent text-accent" />
          {item.rating.toFixed(2)}
        </div>
        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-90">
            {item.region}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
            {item.name}
          </h3>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{item.days}</span>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
  if (!href) return content;
  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
