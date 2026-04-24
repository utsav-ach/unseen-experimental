import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  MessageSquare,
  Route,
  Compass,
  Sparkles,
} from "lucide-react";

import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { DestinationCard } from "@/components/featured/destination-card";
import { GuideCard } from "@/components/featured/guide-card";
import { StoryCard } from "@/components/featured/story-card";
import {
  heroImage,
  featuredDestinations,
  featuredGuides,
  featuredStories,
  testimonials,
} from "@/lib/images";

export const metadata: Metadata = {
  title: "Unseen Nepal — Local guides for extraordinary journeys",
  description:
    "Discover Nepal with trusted local guides. Browse destinations, negotiate custom trips, or book curated packages. Transparent pricing, verified hosts.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Navbar transparent />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt="Himalayan peaks at golden hour"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        </div>
        <div className="container-wide flex min-h-[88vh] flex-col justify-end pb-20 pt-32 text-white">
          <div className="max-w-3xl animate-fade-up">
            <p className="section-eyebrow text-white/80">
              Curated by locals · Verified guides · Transparent pricing
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
              Go beyond the brochure.
              <br />
              See Nepal the way we do.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Treks above five thousand meters, Newari courtyards, rhododendron
              valleys, and a thousand stories. Built and led by guides who grew
              up in these hills.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-white/90"
              >
                Explore destinations
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Browse packages
              </Link>
            </div>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8 border-t border-white/20 pt-8">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Verified guides
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  260+
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Trips completed
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  14k+
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Average rating
                </dt>
                <dd className="mt-1 flex items-center gap-1 font-display text-3xl font-semibold">
                  4.92
                  <Star className="size-5 fill-white text-white" />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Featured destinations */}
      <section className="bg-background">
        <div className="container-wide py-24">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="section-eyebrow">Featured destinations</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                Places our guides keep returning to
              </h2>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Each destination is vetted, mapped, and paired with guides who
                live within walking distance of the trailhead.
              </p>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              See all destinations
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.slice(0, 6).map((d, idx) => (
              <DestinationCard
                key={d.id}
                item={d}
                href={`/destinations/${d.id}`}
                priority={idx < 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40">
        <div className="container-wide py-24">
          <div className="max-w-2xl">
            <p className="section-eyebrow">How Unseen works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Three steps from &ldquo;I want to go&rdquo; to boots on the trail
            </h2>
          </div>
          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Compass,
                title: "Pick a destination or package",
                body: "Browse curated regions, pre-built packages, or start from an activity. Use the map to find guides near you.",
              },
              {
                step: "02",
                icon: MessageSquare,
                title: "Negotiate your trip in three messages",
                body: "Tourists share intent, guides reply with a price, tourists accept. No DMs, no ambiguity, clear scope in writing.",
              },
              {
                step: "03",
                icon: Route,
                title: "Pre-pay, then just go",
                body: "Escrow the prepay through Unseen, meet your guide, pay the balance on completion. You're covered if anything changes.",
              },
            ].map(({ step, icon: Icon, title, body }) => (
              <li
                key={step}
                className="card-elevated flex h-full flex-col p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-medium text-muted-foreground">
                    {step}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap items-center gap-6 rounded-[var(--radius)] border border-border/60 bg-background p-6 text-sm">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent">
              <ShieldCheck className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-medium">Every guide is verified in person</p>
              <p className="text-muted-foreground">
                KYC, references, trek history, and a local ground team visit
                before any guide goes live on Unseen.
              </p>
            </div>
            <Link
              href="/guide/register"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
            >
              Become a guide
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured guides */}
      <section className="bg-background">
        <div className="container-wide py-24">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-eyebrow">Meet the guides</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">
                Real people, real mountains
              </h2>
            </div>
            <Link
              href="/destinations/map"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Find guides on the map
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredGuides.map((g) => (
              <GuideCard key={g.id} guide={g} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-foreground text-background">
        <div className="container-wide py-24">
          <div className="max-w-2xl">
            <p className="section-eyebrow text-accent">What travellers say</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              4.92 stars across fourteen thousand trips
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.author}
                className="flex h-full flex-col justify-between rounded-[var(--radius)] border border-white/10 bg-white/5 p-8"
              >
                <Sparkles className="size-5 text-accent" />
                <blockquote className="mt-6 text-lg leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-8 text-sm text-background/70">
                  <span className="font-semibold text-background">
                    {t.author}
                  </span>
                  <span className="mx-2">·</span>
                  {t.trip}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="bg-background">
        <div className="container-wide py-24">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-eyebrow">From the trail</p>
              <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
                Stories from our community
              </h2>
            </div>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              All stories
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredStories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="container-wide grid gap-10 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Your Nepal trip starts with a conversation.
            </h2>
            <p className="mt-4 max-w-lg text-primary-foreground/80">
              Create an account, describe what you want to see, and we&apos;ll
              match you with three guides in under a day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-white/90"
            >
              Create your account
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Keep exploring
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
