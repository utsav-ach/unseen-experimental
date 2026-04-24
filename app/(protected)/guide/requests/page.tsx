"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useGuideStore } from "@/backend/v2/stores/useGuideStore";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { BookingRequestCard } from "@/components/bookings/booking-request-card";
import { Guard } from "@/components/auth/auth-initializer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuideDashboard() {
	const profile = useAuthStore((state) => state.profile());
	const {
		fetchDashboardRequests,
		dashboardRequests: requests,
		isLoadingDashboard: isLoading,
		error,
	} = useGuideStore();

	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (profile?.id) {
			fetchDashboardRequests(profile.id);
		}
	}, [profile?.id, fetchDashboardRequests]);

	const filteredRequests = requests.filter(
		(request) =>
			(request.tourist_name?.toLowerCase() || "").includes(
				searchQuery.toLowerCase(),
			) ||
			(request.destinations?.toLowerCase() || "").includes(
				searchQuery.toLowerCase(),
			),
	);

	const isGuide = Boolean(profile?.is_guide);
	const hasPendingApplication =
		Boolean(profile?.is_guide_applicantion_pending) && !isGuide;

	return (
		<Guard fallbackMessage="guide dashboard">
			{!isGuide ? (
				<main className="min-h-screen bg-background">
					<section className="mx-auto max-w-2xl px-4 py-16">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Guide account required</AlertTitle>
							<AlertDescription>
								You need an approved guide account to access the
								guide dashboard.
							</AlertDescription>
						</Alert>
						<div className="mt-4 flex flex-wrap gap-3">
							<Button asChild>
								<Link
									href={
										hasPendingApplication
											? "/guide/register/status"
											: "/guide/register"
									}>
									{hasPendingApplication
										? "View application status"
										: "Apply for guide"}
								</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/">Go home</Link>
							</Button>
						</div>
					</section>
				</main>
			) : (
				<main className="min-h-screen bg-background">
					<section className="border-b bg-muted/20">
						<div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-10 md:py-12">
							<h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
								Guide dashboard
							</h1>
							<p className="text-sm text-muted-foreground">
								Review incoming requests, open details, and send
								your approval or rejection.
							</p>
						</div>
					</section>

					<section className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
						<div className="mb-6 grid gap-3 rounded-xl border bg-card p-3 md:grid-cols-[1fr_200px]">
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={searchQuery}
									onChange={(event) =>
										setSearchQuery(event.target.value)
									}
									placeholder="Filter by tourist or destination"
									className="h-11 rounded-lg pl-10"
								/>
							</div>
							<div className="flex items-center justify-end text-sm text-muted-foreground">
								{filteredRequests.length} request
								{filteredRequests.length === 1 ? "" : "s"}
							</div>
						</div>

						{error ? (
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Could not load requests</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						) : null}

						{isLoading && requests.length === 0 ? (
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, index) => (
									<div
										key={index}
										className="rounded-xl border p-4">
										<Skeleton className="h-6 w-1/3" />
										<Skeleton className="mt-3 h-4 w-2/3" />
										<Skeleton className="mt-3 h-10 w-full" />
									</div>
								))}
							</div>
						) : filteredRequests.length > 0 ? (
							<div className="grid grid-cols-1 gap-4">
								{filteredRequests.map((request) => (
									<BookingRequestCard
										key={request.id}
										request={request}
										showTourist
									/>
								))}
							</div>
						) : (
							<div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
								<p className="text-sm text-muted-foreground">
									No requests matched your current filter.
								</p>
							</div>
						)}
					</section>
				</main>
			)}
		</Guard>
	);
}
