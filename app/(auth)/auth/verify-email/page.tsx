"use client";

import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Mail, LogOut, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * VerifyEmailPage component.
 * Tells the user to check their email for a verification link.
 * Includes a logout button and light/dark mode support (via global theme).
 */
export default function VerifyEmailPage() {
	const {
		currentUser,
		profileData,
		logout,
		initialize,
		resendVerificationEmail,
		isEmailVerified,
		isLoading,
		error,
	} = useAuthStore();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isChecking, setIsChecking] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);

	// If the user's email is already verified, redirect them to the home page or dashboard
	useEffect(() => {
		if (isEmailVerified()) {
			router.replace("/");
		}
	}, [currentUser, profileData, isEmailVerified, router]);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	const handleRefreshStatus = async () => {
		setIsChecking(true);
		try {
			await initialize();
		} finally {
			setIsChecking(false);
		}
	};

	const handleResend = async () => {
		setIsResending(true);
		setNotice(null);
		const ok = await resendVerificationEmail();
		setIsResending(false);
		if (ok) {
			setNotice(
				"Verification link sent again. Please check your inbox and spam folder.",
			);
		}
	};

	const userEmail = currentUser?.email || profileData?.email || "your inbox";

	return (
		<div className="flex min-h-[85vh] items-center justify-center p-4 bg-background/50">
			<Card className="w-full max-w-md border-primary/10 shadow-2xl overflow-hidden glass-card relative">
				{/* Decorative gradient bar */}
				<div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

				<CardHeader className="text-center space-y-4 pt-10 pb-8">
					<div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
						<Mail className="h-10 w-10 text-primary animate-pulse" />
					</div>
					<div className="space-y-2 px-2">
						<CardTitle className="text-3xl font-display font-black tracking-tight">
							Check Your Email
						</CardTitle>
						<CardDescription className="text-muted-foreground text-sm font-medium">
							We&apos;ve sent a magic link to{" "}
							<span className="text-foreground font-bold">
								{userEmail}
							</span>
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-6 text-center px-8">
					{notice ? (
						<div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
							{notice}
						</div>
					) : null}
					{error ? (
						<div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
							{error}
						</div>
					) : null}
					<div className="relative group">
						<div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
						<div className="relative p-6 rounded-xl bg-card/10 border border-primary/5 backdrop-blur-sm space-y-3">
							<p className="text-sm font-semibold text-foreground">
								Verification link sent!
							</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Opening the link in the email will automatically
								verify your account and grant you full access to
								Unseen Nepal.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 justify-center text-xs text-muted-foreground bg-muted/30 p-3 rounded-full border border-border/50">
						<span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
						Waiting for verification...
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-4 px-8 pb-10">
					<Button
						variant="outline"
						size="lg"
						disabled={isResending || isLoading}
						className="w-full font-bold h-12"
						onClick={handleResend}>
						{isResending ? (
							<Loader2 className="mr-2 h-5 w-5 animate-spin" />
						) : (
							<Mail className="mr-2 h-5 w-5" />
						)}
						Resend verification link
					</Button>

					<Button
						variant="default"
						size="lg"
						disabled={isChecking}
						className="w-full font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.95] h-12"
						onClick={handleRefreshStatus}>
						{isChecking ? (
							<Loader2 className="mr-2 h-5 w-5 animate-spin" />
						) : (
							<RefreshCw className="mr-2 h-5 w-5" />
						)}
						I&apos;ve clicked the link
					</Button>

					<div className="relative w-full flex items-center justify-center py-2">
						<div className="absolute inset-x-0 h-px bg-border/50" />
						<span className="relative bg-card px-3 text-[10px] uppercase tracking-widest font-black text-muted-foreground/40">
							Or
						</span>
					</div>

					<Button
						variant="ghost"
						size="sm"
						disabled={isLoggingOut}
						onClick={handleLogout}
						className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 group transition-all h-10 font-bold">
						{isLoggingOut ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<LogOut className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
						)}
						Sign Out & Try Another Account
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
