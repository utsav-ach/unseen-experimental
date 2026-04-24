"use client";

import { useState, useEffect } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	User,
	Settings,
	LogOut,
	AlertTriangle,
	MessageSquare,
	TrendingUp,
	Compass,
	LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { AuthState, useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export function UserNav() {
	const profile = useAuthStore((state: AuthState) => state.profile());
	const logout = useAuthStore((state: AuthState) => state.logout);
	const is_onboarding_done = useAuthStore((state: AuthState) =>
		state.is_onboarding_done(),
	);

	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const router = useRouter();
	const pathname = usePathname();

	const handleLogoutConfirm = async () => {
		setIsLoggingOut(true);
		await logout();
		router.refresh();

		const authRequiredPaths = [
			"/onboarding",
			"/profile",
			"/settings",
			"/bookings",
		];

		if (authRequiredPaths.some((p) => pathname.startsWith(p))) {
			router.push("/login");
		}

		setShowLogoutConfirm(false);
		setIsLoggingOut(false);
	};

	if (!mounted || !profile) {
		return null;
	}

	const initials =
		profile?.first_name && profile?.last_name
			? `${profile.first_name[0]}${profile.last_name[0]}`
			: profile?.username?.[0]?.toUpperCase() || "U";

	const isGuide = Boolean(profile?.is_guide);
	const isGuideApplicationPending =
		Boolean(profile?.is_guide_applicantion_pending) && !isGuide;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="relative h-10 w-10 rounded-full ring-offset-background hover:ring-2 hover:ring-primary-light transition-all p-0 overflow-hidden shadow-lg shadow-primary/5">
						<Avatar className="h-10 w-10 border border-border">
							<AvatarImage
								src={profile?.avatar_url || ""}
								alt={profile?.username || "user"}
							/>
							<AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-56 mt-2 rounded-2xl p-2 border-border/50 backdrop-blur-xl bg-background/95 shadow-2xl shadow-primary/10"
					align="end"
					forceMount>
					<DropdownMenuLabel className="font-normal p-3">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-bold leading-none">
								{profile?.first_name
									? `${profile.first_name} ${profile.last_name || ""}`
									: profile?.username}
							</p>
							<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">
								{profile?.is_admin
									? "Admin"
									: profile?.is_guide
										? "Guide"
										: "Traveler"}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-border/40" />
					<DropdownMenuGroup className="space-y-1 mt-1">
						{is_onboarding_done ? (
							CompleteDropdown(
								isGuide,
								isGuideApplicationPending,
								is_onboarding_done,
							)
						) : (
							<DropdownMenuItem
								asChild
								className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
								<Link
									href="/onboarding"
									className="flex w-full items-center">
									<AlertTriangle className="mr-3 h-4 w-4 text-yellow" />
									<span className="font-medium">
										Complete Profile Setup
									</span>
								</Link>
							</DropdownMenuItem>
						)}

						<DropdownMenuItem
							asChild
							className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
							<Link
								href="/settings"
								className="flex w-full items-center">
								<Settings className="mr-3 h-4 w-4" />
								<span className="font-medium">Settings</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator className="bg-border/40" />
					<DropdownMenuItem
						onClick={(e) => {
							e.preventDefault();
							setShowLogoutConfirm(true);
						}}
						className="rounded-xl focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer transition-colors p-2.5 mt-1">
						<LogOut className="mr-3 h-4 w-4" />
						<span className="font-bold">Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AnimatePresence>
				{showLogoutConfirm && (
					<div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-background/80 backdrop-blur-sm"
							onClick={() =>
								!isLoggingOut && setShowLogoutConfirm(false)
							}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{
								type: "spring",
								bounce: 0.3,
								duration: 0.4,
							}}
							className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-border/50 bg-card p-6 shadow-2xl shadow-black/10 dark:shadow-black/40">
							<div className="flex flex-col items-center text-center">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
									<AlertTriangle className="h-6 w-6 text-destructive" />
								</div>
								<h2 className="mb-2 font-display text-xl font-bold tracking-tight text-foreground">
									Ready to leave?
								</h2>
								<p className="mb-6 text-sm text-muted-foreground">
									Are you sure you want to securely log out of
									your Unseen Nepal account? You will need to
									sign in again to book guides or post
									stories.
								</p>
								<div className="flex w-full flex-col gap-2">
									<Button
										onClick={handleLogoutConfirm}
										disabled={isLoggingOut}
										variant="destructive"
										className="h-12 w-full rounded-xl font-bold">
										{isLoggingOut
											? "Logging out..."
											: "Yes, log me out"}
									</Button>
									<Button
										onClick={() =>
											setShowLogoutConfirm(false)
										}
										disabled={isLoggingOut}
										variant="ghost"
										className="h-12 w-full rounded-xl font-bold hover:bg-muted">
										Cancel
									</Button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}

function CompleteDropdown(
	isGuide: boolean,
	isGuideApplicationPending: boolean,
	is_onboarding_done: boolean,
) {
	return (
		<>
			<DropdownMenuItem
				asChild
				className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
				<Link href="/profile" className="flex w-full items-center">
					<User className="mr-3 h-4 w-4" />
					<span className="font-medium">Profile</span>
				</Link>
			</DropdownMenuItem>
			<DropdownMenuItem
				asChild
				className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
				<Link href="/bookings" className="flex w-full items-center">
					<MessageSquare className="mr-3 h-4 w-4" />
					<span className="font-medium">My Bookings</span>
				</Link>
			</DropdownMenuItem>

			{isGuide && (
				<DropdownMenuItem
					asChild
					className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
					<Link
						href="/guide/requests"
						className="flex w-full items-center">
						<TrendingUp className="mr-3 h-4 w-4 text-primary" />
						<span className="font-bold text-primary">
							Guide Dashboard
						</span>
					</Link>
				</DropdownMenuItem>
			)}

			{!isGuide && !isGuideApplicationPending && (
				<DropdownMenuItem
					asChild
					className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
					<Link
						href="/guide/register"
						className="flex w-full items-center">
						<Compass className="mr-3 h-4 w-4" />
						<span className="font-medium">Apply for Guide</span>
					</Link>
				</DropdownMenuItem>
			)}

			{!isGuide && isGuideApplicationPending && (
				<DropdownMenuItem
					asChild
					className="rounded-xl focus:bg-primary-ultra-light focus:text-primary-dark cursor-pointer transition-colors p-2.5">
					<Link
						href="/guide/register/status"
						className="flex w-full items-center">
						<LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
						<span className="font-medium">Application Status</span>
					</Link>
				</DropdownMenuItem>
			)}
		</>
	);
}
