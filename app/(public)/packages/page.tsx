import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { destinationService } from "@/backend/v2/services/destination-services";
import { env } from "@/lib/env";
import { featuredDestinations } from "@/lib/images";

export const metadata: Metadata = {
  title: "Travel packages",
  description:
    "Pre-planned trips with fixed prices. Book directly, no negotiation.",
};

interface Pkg {
  id: string;
  name: string;
  description: string;
  image: string;
  days: number;
  priceNpr: number;
  compareAtNpr?: number;
  type: "destination" | "activity";
  region: string;
}

const fallbackPackages: Pkg[] = [
  {
    id: "ebc-classic",
    name: "Classic Everest Base Camp",
    description:
      "Twelve days from Lukla. Guide, porter, teahouse stays, and permits included.",
    image: featuredDestinations[0].image,
    days: 12,
    priceNpr: 215000,
    compareAtNpr: 245000,
    type: "destination",
    region: "Solukhumbu",
  },
  {
    id: "annapurna-lite",
    name: "Annapurna Base Camp (lite)",
    description:
      "A tighter seven-day route through Chhomrong and Jhinu. Great for first-time trekkers.",
    image: featuredDestinations[1].image,
    days: 7,
    priceNpr: 128000,
    type: "destination",
    region: "Gandaki",
  },
  {
    id: "ktm-heritage",
    name: "Kathmandu Heritage Weekend",
    description:
      "Three UNESCO sites, two Newari meals, one sunrise in Nagarkot.",
    image: featuredDestinations[2].image,
    days: 3,
    priceNpr: 32000,
    type: "destination",
    region: "Bagmati",
  },
  {
    id: "chitwan-family",
    name: "Chitwan Jungle Family",
    description:
      "Jeep safari, canoe, elephant breeding centre. Kid-friendly lodge and activities.",
    image: featuredDestinations[4].image,
    days: 3,
    priceNpr: 45000,
    type: "activity",
    region: "Terai",
  },
  {
    id: "mustang-cultural",
    name: "Upper Mustang by Jeep",
    description:
      "Seven days across the Tibetan plateau kingdom. Jeep-supported, teahouse nights.",
    image: featuredDestinations[5].image,
    days: 7,
    priceNpr: 187000,
    type: "destination",
    region: "Mustang",
  },
  {
    id: "pokhara-paraglide",
    name: "Pokhara Paraglide + Lakes",
    description:
      "Tandem paragliding, lakeside stay, and a day trip to Begnas. Relaxed pacing.",
    image: featuredDestinations[3].image,
    days: 2,
    priceNpr: 22000,
    type: "activity",
    region: "Gandaki",
  },
];

function fmtNpr(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export default async function PackagesPage() {
  const live = env.BACKEND_URL
    ? await Promise.all([
        destinationService.listDestinationPackages().catch(() => []),
        destinationService.listActivityPackages().catch(() => []),
      ]).then(([a, b]) => [...a, ...b])
    : [];

  const items: Pkg[] =
    live.length > 0
      ? live.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.featured_image ?? featuredDestinations[0].image,
          days: p.total_days,
          priceNpr: Number(p.discounted_price ?? p.actual_price),
          compareAtNpr: p.discounted_price
            ? Number(p.actual_price)
            : undefined,
          type: p.type,
          region: "Nepal",
        }))
      : fallbackPackages;

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container-wide py-16">
          <p className="section-eyebrow">Ready to go</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            Travel packages
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Pre-negotiated itineraries with fixed pricing. Pay, pack, go. No
            back-and-forth required.
          </p>
        </div>
      </section>
      <section className="container-wide py-16">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No packages yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, idx) => (
              <li key={p.id}>
                <Link
                  href={`/packages/details/${p.id}`}
                  className="block h-full"
                >
                  <article className="card-elevated group flex h-full flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        priority={idx < 3}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                          {p.type === "destination" ? "Trip" : "Activity"}
                        </span>
                        <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                          {p.days} days
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                        {p.region}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
                        {p.name}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                      <div className="mt-auto flex items-end justify-between pt-5">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            from
                          </p>
                          <p className="font-display text-2xl font-semibold">
                            NPR {fmtNpr(p.priceNpr)}
                          </p>
                          {p.compareAtNpr && (
                            <p className="text-xs text-muted-foreground line-through">
                              NPR {fmtNpr(p.compareAtNpr)}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                          Book →
                        </span>
                      </div>
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
