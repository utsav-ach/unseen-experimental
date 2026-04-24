"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { UserNav } from "@/components/user-nav";

export function AuthEntryAction() {
	const isInitializing = useAuthStore((state) => state.isInitializing);
	const isLoggedInFn = useAuthStore((state) => state.is_logged_in);
	const isOnboardingDone = useAuthStore((state) =>
		state.is_onboarding_done(),
	);
	const isAuthVerified = useAuthStore((state) => state.isEmailVerified());

	const router = useRouter();

	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const isLoggedIn = mounted ? isLoggedInFn() : false;

	const handleLogin = () => {
		router.push("/login");
	};

	if (!mounted || isInitializing) {
		return (
			<Button
				variant="ghost"
				disabled
				aria-busy="true"
				className="h-9 px-4 rounded-full">
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				<span>Loading</span>
			</Button>
		);
	}

	if (!isLoggedIn) {
		return (
			<Button
				variant="ghost"
				onClick={handleLogin}
				className="h-9 px-4 rounded-full font-semibold">
				<LogIn className="mr-2 h-4 w-4" />
				<span>Login</span>
			</Button>
		);
	}

	const showEmailWarning = !isAuthVerified;
	const showOnboardingWarning = isAuthVerified && !isOnboardingDone;

	return (
		<div className="flex items-center gap-2">
			{showEmailWarning ? (
				<span title="Email is not verified" className="inline-flex">
					<AlertTriangle
						className="h-4 w-4 text-destructive"
						aria-label="Email not verified"
					/>
				</span>
			) : null}

			{showOnboardingWarning ? (
				<span
					title="Onboarding is not complete"
					className="inline-flex">
					<AlertTriangle
						className="h-4 w-4 text-yellow-500"
						aria-label="Onboarding incomplete"
					/>
				</span>
			) : null}

			<UserNav />
		</div>
	);
}
