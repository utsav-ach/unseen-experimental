"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthEntryAction } from "@/components/auth/auth-entry-action";
import { navMenus, getGuideMenu, adminMenu, NavItem } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetClose,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function Navbar({ hideLinks = false }: { hideLinks?: boolean }) {
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);

	// Auth Store Logic
	const profile = useAuthStore((state) => state.profile());
	const isGuide = Boolean(profile?.is_guide);
	const isGuideApplicationPending =
		Boolean(profile?.is_guide_applicantion_pending) && !isGuide;
	const isAdmin = Boolean(profile?.is_admin);

	const professionalLinks = useMemo(() => {
		const links = [] as NavItem[];

		const dynamicGuideMenu = getGuideMenu({
			isGuide,
			isGuideApplicationPending,
		});

		if (dynamicGuideMenu) {
			links.push(dynamicGuideMenu);
		}

		if (isAdmin) {
			links.push(adminMenu);
		}

		return links;
	}, [isGuide, isGuideApplicationPending, isAdmin]);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={cn(
				"fixed top-0 left-0 right-0 z-50 h-16 border-b transition-all duration-300",
				isScrolled
					? "border-border/70 bg-background/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl"
					: "border-transparent bg-background/80 shadow-[0_6px_18px_rgba(0,0,0,0.04)] backdrop-blur-xl",
			)}>
			<div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-2.5 shrink-0">
					{/* Mobile Menu */}
					{!hideLinks && (
						<div className="lg:hidden">
							<Sheet>
								<SheetTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10 rounded-lg hover:bg-muted active:scale-95">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent
									side="left"
									className="w-full max-w-sm overflow-y-auto bg-background/95 px-5 py-6 backdrop-blur-xl sm:px-6">
									<SheetHeader className="mb-6 flex flex-row items-center justify-between space-y-0">
										<Link
											href="/"
											className="flex items-center gap-2.5">
											<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
												<Mountain className="h-5 w-5" />
											</div>
											<span className="text-sm font-semibold tracking-tight text-foreground">
												Unseen Nepal
											</span>
										</Link>
										<SheetClose asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-10 w-10 rounded-lg">
												<X className="h-5 w-5" />
											</Button>
										</SheetClose>
									</SheetHeader>

									<div className="space-y-6 pb-8">
										<MobileNavSection
											title="Browse"
											items={navMenus}
											pathname={pathname}
										/>

										{professionalLinks.length > 0 && (
											<div className="space-y-3">
												<div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
													Workspace
												</div>
												<div className="space-y-2">
													{professionalLinks.map(
														(menu) => (
															<div
																key={menu.title}
																className="rounded-xl border bg-card p-3 shadow-sm">
																<div className="mb-2 text-sm font-medium text-foreground">
																	{menu.title}
																</div>
																<div className="space-y-1">
																	{menu.children?.map(
																		(
																			child,
																		) => (
																			<SheetClose
																				asChild
																				key={
																					child.title
																				}>
																				<Link
																					href={
																						child.href
																					}
																					className={cn(
																						"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
																						pathname ===
																							child.href &&
																							"bg-muted",
																					)}>
																					<child.icon className="h-4 w-4 text-primary" />
																					<span>
																						{
																							child.title
																						}
																					</span>
																				</Link>
																			</SheetClose>
																		),
																	)}
																</div>
															</div>
														),
													)}
												</div>
											</div>
										)}
									</div>
								</SheetContent>
							</Sheet>
						</div>
					)}

					{/* 1. Brand Logo */}
					<Link
						href="/"
						className="flex items-center gap-2.5 group shrink-0">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
							<Mountain className="h-5 w-5" />
						</div>
						<span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
							Unseen{" "}
							<span className="text-primary italic font-medium tracking-normal">
								Nepal
							</span>
						</span>
					</Link>
				</div>

				{/* 2. Desktop Simple Navigation */}
				{!hideLinks && (
					<div className="hidden lg:flex items-center gap-2 overflow-x-auto rounded-full border border-border/70 bg-background/70 px-2 py-1.5 shadow-sm backdrop-blur-md no-scrollbar max-w-[70vw]">
						{navMenus.map((menu) => (
							<Link
								key={menu.title}
								href={menu.href}
								className={cn(
									"whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-all hover:bg-muted/90 hover:text-foreground",
									pathname === menu.href &&
										"bg-muted text-foreground shadow-sm",
								)}>
								{menu.title}
							</Link>
						))}

						{professionalLinks.length > 0 && (
							<Separator
								orientation="vertical"
								className="mx-1 h-5"
							/>
						)}

						{professionalLinks
							.flatMap((menu) => menu.children ?? [])
							.map((child) => (
								<Link
									key={`${child.title}-${child.href}`}
									href={child.href}
									className={cn(
										"whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-all hover:bg-primary/10 hover:text-primary",
										pathname === child.href &&
											"bg-primary/10 text-primary shadow-sm",
									)}>
									{child.title}
								</Link>
							))}
					</div>
				)}

				{/* 3. Global Actions */}
				<div className="flex items-center gap-2 sm:gap-3">
					<ThemeToggle />
					<div className="hidden h-5 w-px bg-border/60 sm:block" />
					<AuthEntryAction />
				</div>
			</div>
		</nav>
	);
}

function MobileNavSection({
	title,
	items,
	pathname,
}: {
	title: string;
	items: NavItem[];
	pathname: string;
}) {
	return (
		<div className="space-y-3">
			<div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
				{title}
			</div>
			<div className="space-y-3">
				{items.map((menu) => (
					<div
						key={menu.title}
						className="rounded-xl border bg-card p-3 shadow-sm">
						<div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
							<menu.icon className="h-4 w-4 text-primary" />
							<span>{menu.title}</span>
						</div>
						<div className="space-y-1">
							{menu.isStandalone ? (
								<SheetClose asChild>
									<Link
										href={menu.href}
										className={cn(
											"flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
											pathname === menu.href &&
												"bg-muted",
										)}>
										<span>{menu.title}</span>
										<ChevronRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</SheetClose>
							) : (
								menu.children?.map((child) => (
									<SheetClose asChild key={child.title}>
										<Link
											href={child.href}
											className={cn(
												"flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
												pathname === child.href &&
													"bg-muted",
											)}>
											<span>{child.title}</span>
											<ChevronRight className="h-4 w-4 text-muted-foreground" />
										</Link>
									</SheetClose>
								))
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
