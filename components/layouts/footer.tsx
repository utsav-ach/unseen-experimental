import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} Unseen Nepal</p>
        <nav className="flex items-center gap-4">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
