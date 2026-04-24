import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unseen Nepal — discover Nepal with local guides",
  description:
    "Find destinations, book local guides, and plan authentic trips across Nepal.",
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 p-8 text-center">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Unseen Nepal
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover Nepal with local guides. Plan trips, find destinations, and
          share stories.
        </p>
      </section>
      <nav className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link
          href="/destinations"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Explore destinations
        </Link>
        <Link
          href="/packages"
          className="rounded-md border border-border px-4 py-2 hover:bg-accent"
        >
          Travel packages
        </Link>
        <Link
          href="/stories"
          className="rounded-md border border-border px-4 py-2 hover:bg-accent"
        >
          Stories
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-border px-4 py-2 hover:bg-accent"
        >
          Log in
        </Link>
      </nav>
    </main>
  );
}
