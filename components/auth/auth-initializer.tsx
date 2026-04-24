"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AuthState, useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useRouter } from "next/navigation";
import {
	Loader2,
	LogIn,
	ArrowLeft,
	Lock,
	UserCheck,
	MailWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthProfile } from "@/backend/v2/models/user-models";

/**
 * AuthInitializer Component
 *
 * Minimal component that ensures the auth store is initialized once at the root level.
 */
export function AuthInitializer({ profileData }: { profileData: AuthProfile }) {
	useEffect(() => {
		useAuthStore.setState({
			profileData,
			isInitializing: false,
		});
	}, [profileData]);
	return null;
}

interface GuardProps {
	children: React.ReactNode;
	/** Human readable page name shown in fallback messages */
	fallbackMessage?: string;
	/** Optional fallback route, defaults to router.back() */
	fallbackPath?: string;
}

export function Guard({
	children,
	fallbackMessage = "this page",
	fallbackPath,
}: GuardProps) {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
	const router = useRouter();

	const isInitializing = useAuthStore(
		(state: AuthState) => state.isInitializing,
	);
	const isLoggedIn = useAuthStore((state: AuthState) => state.is_logged_in());
	const isVerified = useAuthStore((state: AuthState) =>
		state.isEmailVerified(),
	);
	const onboardingDone = useAuthStore((state: AuthState) =>
		state.is_onboarding_done(),
	);
	const resendVerificationEmail = useAuthStore(
		(state: AuthState) => state.resendVerificationEmail,
	);
	const isLoading = useAuthStore((state: AuthState) => state.isLoading);

	const goBack = () => {
		if (fallbackPath) {
			router.push(fallbackPath);
			return;
		}
		router.back();
	};

	const handleResendVerification = async () => {
		const ok = await resendVerificationEmail();
		if (ok) {
			toast.success("Verification email sent. Please check your inbox.");
			return;
		}
		toast.error("Could not resend verification email. Please try again.");
	};

	if (!mounted) return null;

	if (isInitializing) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center p-8">
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					Verifying session...
				</div>
			</div>
		);
	}

	if (!isLoggedIn) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<h2 className="text-xl font-semibold text-foreground">
						Sorry you are not logged in
					</h2>
					<p className="mt-3 text-sm text-muted-foreground">
						You must be logged in to access the {fallbackMessage}.
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						You are not logged in please login to continue.
					</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button
							onClick={() => router.push("/login")}
							className="rounded-lg">
							<LogIn className="mr-2 h-4 w-4" />
							Login
						</Button>
						<Button
							variant="outline"
							onClick={goBack}
							className="rounded-lg">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!isVerified) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
						<MailWarning className="h-6 w-6 text-amber-500" />
					</div>
					<h2 className="text-xl font-semibold text-foreground">
						Sorry your account is not verified yet
					</h2>
					<p className="mt-3 text-sm text-muted-foreground">
						You must first verify your email before accessing the{" "}
						{fallbackMessage}.
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						If you already clicked the link sent in email then
						refresh the page to continue.
					</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button
							onClick={handleResendVerification}
							disabled={isLoading}
							className="rounded-lg">
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<MailWarning className="mr-2 h-4 w-4" />
							)}
							Resend email
						</Button>
						<Button
							variant="outline"
							onClick={goBack}
							className="rounded-lg">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!onboardingDone) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
						<UserCheck className="h-6 w-6 text-primary" />
					</div>
					<h2 className="text-xl font-semibold text-foreground">
						Sorry you havent provided your information
					</h2>
					<p className="mt-3 text-sm text-muted-foreground">
						You must complete your profile setup before accessing
						the {fallbackMessage}.
					</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button
							onClick={() => router.push("/onboarding")}
							className="rounded-lg">
							<UserCheck className="mr-2 h-4 w-4" />
							Setup profile
						</Button>
						<Button
							variant="outline"
							onClick={goBack}
							className="rounded-lg">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}

interface AdminGuardProps {
	children: React.ReactNode;
	fallbackPath?: string;
	fallbackMessage?: string;
}

export function AdminGuard({
	children,
	fallbackPath,
	fallbackMessage = "admin workspace",
}: AdminGuardProps) {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
	const router = useRouter();

	const isInitializing = useAuthStore(
		(state: AuthState) => state.isInitializing,
	);
	const isLoggedIn = useAuthStore((state: AuthState) => state.is_logged_in());
	const isVerified = useAuthStore((state: AuthState) =>
		state.isEmailVerified(),
	);
	const onboardingDone = useAuthStore((state: AuthState) =>
		state.is_onboarding_done(),
	);
	const isAdmin = useAuthStore(
		(state: AuthState) => state.profile()?.is_admin || false,
	);

	const goBack = () => {
		if (fallbackPath) {
			router.push(fallbackPath);
			return;
		}
		router.back();
	};

	useEffect(() => {
		if (!mounted || isInitializing) return;

		if (isLoggedIn && (!isVerified || !onboardingDone || !isAdmin)) {
			router.replace(fallbackPath ?? "/");
		}
	}, [
		mounted,
		isInitializing,
		isLoggedIn,
		isVerified,
		onboardingDone,
		isAdmin,
		router,
		fallbackPath,
	]);

	if (!mounted) return null;

	if (isInitializing) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center p-8">
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					Verifying session...
				</div>
			</div>
		);
	}

	if (!isLoggedIn) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<h2 className="text-xl font-semibold text-foreground">
						Sorry you are not logged in
					</h2>
					<p className="mt-3 text-sm text-muted-foreground">
						You must be logged in to access the {fallbackMessage}.
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						You are not logged in please login to continue.
					</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button
							onClick={() => router.push("/login")}
							className="rounded-lg">
							<LogIn className="mr-2 h-4 w-4" />
							Login
						</Button>
						<Button
							variant="outline"
							onClick={goBack}
							className="rounded-lg">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!isVerified || !onboardingDone || !isAdmin) {
		return null;
	}

	return <>{children}</>;
}
