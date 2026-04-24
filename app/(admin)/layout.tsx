import { notFound } from "next/navigation";
import Link from "next/link";
import { authService } from "@/backend/v2/services/auth-services";
import { userService } from "@/backend/v2/services/user-services";
import { env } from "@/lib/env";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/settings", label: "Settings" },
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
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-muted/30 md:block">
        <div className="p-4 text-sm font-semibold">Admin</div>
        <nav className="space-y-1 px-2 pb-4 text-sm">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
