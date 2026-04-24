import Link from "next/link";
import { Mountain, Instagram, Facebook, Youtube } from "lucide-react";

const groups: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/packages", label: "Packages" },
      { href: "/activities", label: "Activities" },
      { href: "/trek-dai", label: "Trek Dai" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/stories", label: "Stories" },
      { href: "/photos", label: "Photos" },
      { href: "/guide/register", label: "Become a guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container-wide grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mountain className="size-4" aria-hidden />
            </span>
            Unseen Nepal
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Trips to Nepal, built by the people who live here. Transparent
            pricing, verified guides, and itineraries that actually change
            when you want them to.
          </p>
          <div className="mt-6 flex items-center gap-3 text-muted-foreground">
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="rounded-full border border-border/60 p-2 transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="rounded-full border border-border/60 p-2 transition-colors hover:border-primary hover:text-primary"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="rounded-full border border-border/60 p-2 transition-colors hover:border-primary hover:text-primary"
            >
              <Youtube className="size-4" />
            </a>
          </div>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {g.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="container-wide flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Unseen Nepal. Made with care in Kathmandu.</p>
          <p>Registered guides. Transparent pricing. No hidden fees.</p>
        </div>
      </div>
    </footer>
  );
}
