"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { Loader2, Sparkles } from "lucide-react";
import { createBrowserClient } from "@/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

/**
 * AuthCallback Page.
 * Handles the session establishment after OAuth or email verification.
 * Automatically redirects to the destination or dashboard.
 */
export default function AuthCallback() {
	const initialize = useAuthStore((state: any) => state.initialize);
	const getPostLoginRoute = useAuthStore(
		(state: any) => state.getPostLoginRoute,
	);
	const router = useRouter();
	const processed = useRef(false);

	useEffect(() => {
		if (processed.current) return;

		const handleAuth = async () => {
			processed.current = true;
			const supabase = createBrowserClient();

			// Wait until session is established
			const { data } = await supabase.auth.getSession();

			if (data?.session) {
				// Initialize the store to get the complete profile
				await initialize();

				const next = getPostLoginRoute();

				// A short delay for the user to see the "success" state/animation
				setTimeout(() => {
					const safeDest =
						next &&
						!next.includes("/login") &&
						!next.includes("/signup")
							? next
							: "/";
					router.replace(safeDest);
				}, 1500);
			} else {
				console.error("Auth callback failed: No session found");
				router.replace("/login");
			}
		};

		handleAuth();
	}, [initialize, getPostLoginRoute, router]);

	return (
		<div className="flex min-h-[90vh] items-center justify-center p-4 bg-background">
			<Card className="w-full max-w-sm border-none shadow-none bg-transparent overflow-hidden">
				<CardContent className="flex flex-col items-center gap-8 py-12">
					<div className="relative isolate px-4">
						{/* Subtle background glow */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[80px] rounded-full -z-10 animate-pulse" />

						{/* Iconic Loader */}
						<div className="relative h-24 w-24 flex items-center justify-center">
							<div className="absolute inset-0 rounded-3xl border-2 border-primary/10 animate-[spin_4s_linear_infinite]" />
							<div className="absolute inset-2 rounded-2xl border-2 border-dashed border-primary/20 animate-[spin_6s_linear_infinite_reverse]" />

							<div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
								<Loader2 className="h-8 w-8 text-primary animate-spin" />
							</div>

							{/* Decorative sparkles around the loader */}
							<Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
							<Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-primary animate-pulse opacity-50" />
						</div>
					</div>

					<div className="space-y-4 text-center">
						<div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
							<span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary animate-pulse">
								Finalizing Session
							</span>
						</div>

						<div className="space-y-2">
							<h3 className="text-3xl font-display font-black tracking-tight flex items-center justify-center gap-1">
								Welcome Back
								<span className="inline-flex">
									<span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
									<span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s] mx-0.5" />
									<span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
								</span>
							</h3>
							<p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
								We're signing you in to{" "}
								<span className="text-foreground font-bold">
									Unseen Nepal
								</span>
								. You'll be redirected in a moment.
							</p>
						</div>
					</div>

					{/* Progress indicator */}
					<div className="w-full space-y-3 mt-4">
						<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-[2px]">
							<div className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full animate-loader-progress" />
						</div>
						<div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-muted-foreground/40">
							<span>Securing</span>
							<span>Redirecting</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<style jsx global>{`
				@keyframes loader-progress {
					0% {
						width: 0%;
						opacity: 0.5;
					}
					50% {
						width: 80%;
						opacity: 1;
					}
					100% {
						width: 100%;
						opacity: 0.8;
					}
				}
				.animate-loader-progress {
					animation: loader-progress 2s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}
