import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Mountain,
  Compass,
  Waves,
  Tent,
  Camera,
  Flame,
  Leaf,
  Plane,
} from "lucide-react";
import { destinationService } from "@/backend/v2/services/destination-services";
import { env } from "@/lib/env";
import { featuredDestinations } from "@/lib/images";

export const metadata: Metadata = {
  title: "Activities",
  description:
    "Pick an activity and we'll match you with destinations and guides across Nepal.",
};

const fallbackActivities = [
  { id: "trekking", name: "Trekking", icon: Mountain, description: "Multi-day mountain journeys." },
  { id: "climbing", name: "Climbing", icon: Compass, description: "Expedition and peak climbing." },
  { id: "rafting", name: "Rafting", icon: Waves, description: "White water on glacial rivers." },
  { id: "camping", name: "Camping", icon: Tent, description: "High-alpine and forest camps." },
  { id: "photography", name: "Photography", icon: Camera, description: "Sunrise, people, wildlife." },
  { id: "culture", name: "Culture", icon: Flame, description: "Temples, festivals, kitchens." },
  { id: "wildlife", name: "Wildlife", icon: Leaf, description: "Rhinos, tigers, Himalayan birds." },
  { id: "paragliding", name: "Paragliding", icon: Plane, description: "Tandem flights over Pokhara." },
];

export default async function ActivitiesPage() {
  const live = env.BACKEND_URL
    ? await destinationService.listActivities().catch(() => [])
    : [];

  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <Image
            src={featuredDestinations[1].image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        </div>
        <div className="container-wide py-20">
          <p className="section-eyebrow">What do you want to do?</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            Activities
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Pick an activity — we&apos;ll surface the destinations, packages,
            and guides that specialise in it.
          </p>
        </div>
      </section>

      <section className="container-wide py-16">
        {live.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/activities/details/${a.id}`}
                  className="card-elevated block p-6"
                >
                  <h3 className="font-display text-xl font-semibold">
                    {a.name}
                  </h3>
                  {a.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {a.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {fallbackActivities.map(({ id, name, icon: Icon, description }) => (
              <li key={id}>
                <Link
                  href={`/activities/details/${id}`}
                  className="card-elevated flex h-full flex-col gap-3 p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
