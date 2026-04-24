"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/auth/auth-initializer";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import {
	BarChart3,
	Compass,
	FolderKanban,
	MapPinned,
	Mountain,
	Package,
	Settings,
	Shield,
	Users,
	Camera,
	BookOpen,
} from "lucide-react";

const adminNavItems = [
	{ href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
	{
		href: "/admin/guides/applications",
		label: "Guide Applications",
		icon: Shield,
	},
	{ href: "/admin/destinations", label: "Destinations", icon: MapPinned },
	{ href: "/admin/activities", label: "Activities", icon: Compass },
	{ href: "/admin/packages", label: "Packages", icon: Package },
	{ href: "/admin/bookings", label: "Bookings", icon: FolderKanban },
	{ href: "/admin/stories", label: "Stories", icon: BookOpen },
	{ href: "/admin/photos", label: "Photos", icon: Camera },
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<AdminGuard fallbackMessage="admin workspace" fallbackPath="/">
			<div className="min-h-screen bg-background">
				<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
					<aside className="hidden border-r border-border bg-card/40 lg:block">
						<div className="sticky top-0 flex h-screen flex-col">
							<div className="flex items-center gap-2 border-b border-border px-5 py-4">
								<div className="rounded-md bg-primary/10 p-1.5 text-primary">
									<Mountain className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">
										Admin Panel
									</p>
									<p className="text-xs text-muted-foreground">
										Unseen Nepal
									</p>
								</div>
							</div>

							<nav className="flex-1 space-y-1 p-3">
								{adminNavItems.map((item) => {
									const active = pathname === item.href;
									const Icon = item.icon;

									return (
										<Link
											key={item.href}
											href={item.href}
											className={cn(
												"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
												active
													? "bg-primary/10 text-primary"
													: "text-muted-foreground hover:bg-muted hover:text-foreground",
											)}>
											<Icon className="h-4 w-4" />
											<span>{item.label}</span>
										</Link>
									);
								})}
							</nav>
						</div>
					</aside>

					<div className="flex min-h-screen flex-col">
						<header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
							<div className="flex h-14 items-center justify-between px-4 lg:px-6">
								<p className="text-sm font-medium text-foreground">
									Admin Workspace
								</p>
								<div className="flex items-center gap-2">
									<ThemeToggle />
									<UserNav />
								</div>
							</div>
						</header>

						<main className="flex-1 px-4 py-6 lg:px-6 lg:py-8">
							{children}
						</main>
					</div>
				</div>
			</div>
		</AdminGuard>
	);
}
