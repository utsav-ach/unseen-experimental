"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Guard } from "@/components/auth/auth-initializer";
import { Mountain } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding-form";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";

/**
 * Onboarding Page.
 * Uses Guard for auth checks and performs onboarding redirect locally.
 */
export default function OnboardingPage() {
	const router = useRouter();
	const isLoggedIn = useAuthStore((state) => state.is_logged_in());
	const isVerified = useAuthStore((state) => state.isEmailVerified());
	const onboardingDone = useAuthStore((state) => state.is_onboarding_done());

	useEffect(() => {
		if (isLoggedIn) {
			if (!isVerified) {
				router.replace("/verify-email");
			} else if (isVerified && onboardingDone) {
				router.replace("/profile");
			}
		}
	}, [isLoggedIn, isVerified, onboardingDone, router]);

	if (isLoggedIn && isVerified && onboardingDone) {
		return null;
	}

	return (
		<div
			className="min-h-screen bg-neutral-100/30 dark:bg-neutral-900/40 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden"
			suppressHydrationWarning>
			{/* Decorative Background Elements */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

			<div className="w-full relative z-10 flex flex-col items-center gap-12">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="h-16 w-16 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20 animate-in zoom-in-50 duration-700">
						<Mountain className="h-10 w-10" />
					</div>
					<div className="space-y-1">
						<h1 className="text-4xl font-display font-black text-primary-dark dark:text-primary-light tracking-tight">
							Complete Your Profile
						</h1>
						<p className="text-lg text-muted-foreground font-medium max-w-lg font-primary">
							Set up your explorer profile to begin your journey
							across Nepal.
						</p>
					</div>
				</div>

				<div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
					<OnboardingForm />
				</div>
			</div>
		</div>
	);
}
