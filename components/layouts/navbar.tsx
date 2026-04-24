import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <nav className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          Unseen Nepal
        </Link>
        <ul className="hidden items-center gap-6 text-sm md:flex">
          <li>
            <Link href="/destinations" className="hover:text-primary">
              Destinations
            </Link>
          </li>
          <li>
            <Link href="/packages" className="hover:text-primary">
              Packages
            </Link>
          </li>
          <li>
            <Link href="/activities" className="hover:text-primary">
              Activities
            </Link>
          </li>
          <li>
            <Link href="/stories" className="hover:text-primary">
              Stories
            </Link>
          </li>
          <li>
            <Link href="/photos" className="hover:text-primary">
              Photos
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
