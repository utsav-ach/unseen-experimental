import Link from "next/link";
import { Mountain } from "lucide-react";

const links = [
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/activities", label: "Activities" },
  { href: "/stories", label: "Stories" },
  { href: "/photos", label: "Photos" },
];

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const base = transparent
    ? "absolute inset-x-0 top-0 z-30 border-transparent bg-transparent text-white"
    : "sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60";
  return (
    <header className={base}>
      <nav className="container-wide flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <span
            className={`flex size-8 items-center justify-center rounded-full ${
              transparent
                ? "bg-white/15 text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <Mountain className="size-4" aria-hidden />
          </span>
          <span>Unseen Nepal</span>
        </Link>
        <ul className="hidden items-center gap-8 text-sm font-medium md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`transition-colors ${
                  transparent ? "hover:text-white" : "hover:text-primary"
                } opacity-90 hover:opacity-100`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`hidden rounded-full px-4 py-1.5 text-sm font-medium transition-colors md:inline-flex ${
              transparent
                ? "text-white hover:bg-white/10"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              transparent
                ? "bg-white text-foreground hover:bg-white/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
