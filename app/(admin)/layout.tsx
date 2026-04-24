import { notFound } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Map,
  Sparkles,
  Package,
  Mountain,
  CalendarDays,
  Users,
  BookOpen,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { authService } from "@/backend/v2/services/auth-services";
import { userService } from "@/backend/v2/services/user-services";
import { env } from "@/lib/env";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/destinations", label: "Destinations", icon: Map },
  { href: "/admin/activities", label: "Activities", icon: Sparkles },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/guides", label: "Guides", icon: Mountain },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/photos", label: "Photos", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (env.BACKEND_URL) {
    const user = await authService.getSessionUser().catch(() => null);
    if (!user) notFound();
    const profile = await userService.fetchProfile().catch(() => null);
    if (!profile?.is_admin) notFound();
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-5 font-display text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mountain className="size-4" aria-hidden />
          </span>
          Unseen · Admin
        </Link>
        <nav className="flex-1 space-y-0.5 px-3 pb-6 text-sm">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
          v1 · MVP build
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
