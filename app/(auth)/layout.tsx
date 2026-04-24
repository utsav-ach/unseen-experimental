import Image from "next/image";
import Link from "next/link";
import { Mountain } from "lucide-react";
import { heroImage } from "@/lib/images";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Form column */}
      <div className="relative flex flex-col">
        <header className="container mx-auto w-full max-w-md px-6 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-lg font-semibold"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mountain className="size-4" aria-hidden />
            </span>
            Unseen Nepal
          </Link>
        </header>
        <main className="container mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
          <div className="w-full">{children}</div>
        </main>
        <footer className="container mx-auto w-full max-w-md px-6 pb-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Unseen Nepal
        </footer>
      </div>

      {/* Photo column */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src={heroImage}
          alt="Himalayan skyline"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="section-eyebrow text-white/80">
            From our community
          </p>
          <blockquote className="mt-4 max-w-md font-display text-2xl leading-snug">
            &ldquo;Twelve days on the trail, one guide, zero surprises. Unseen
            made the hardest thing I&apos;ve ever done feel like a walk with
            friends.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-white/80">
            — Claudia R., Everest Base Camp · 12 days
          </p>
        </div>
      </aside>
    </div>
  );
}
