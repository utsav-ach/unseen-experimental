import Image from "next/image";
import { Star } from "lucide-react";
import type { FeaturedGuide } from "@/lib/images";

export function GuideCard({ guide }: { guide: FeaturedGuide }) {
  return (
    <article className="card-elevated flex h-full flex-col p-6">
      <div className="flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
          <Image
            src={guide.avatar}
            alt={guide.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-display text-lg font-semibold leading-tight">
            {guide.name}
          </p>
          <p className="text-sm text-muted-foreground">{guide.title}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Region
          </dt>
          <dd className="font-medium">{guide.region}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Trips led
          </dt>
          <dd className="font-medium">{guide.trips}+</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Languages
          </dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {guide.languages.map((l) => (
              <span
                key={l}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {l}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between pt-6 text-sm">
        <div className="flex items-center gap-1 font-medium">
          <Star className="size-4 fill-accent text-accent" />
          {guide.rating.toFixed(2)}
        </div>
        <span className="text-xs text-muted-foreground">
          Verified by Unseen
        </span>
      </div>
    </article>
  );
}
