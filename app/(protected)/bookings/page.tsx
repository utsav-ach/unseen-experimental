"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useBookingRequestStore } from "@/backend/v2/stores/useBookingRequestStore";
import { Search, Loader2, Inbox, ListFilter } from "lucide-react";
import { BookingRequestCard } from "@/components/bookings/booking-request-card";
import { Guard } from "@/components/auth/auth-initializer";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function TouristBookings() {
	const profile = useAuthStore((state: any) => state.profile());
	const {
		fetchMyRequests,
		myRequests: requests,
		isLoading,
		error,
	} = useBookingRequestStore();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		if (profile?.id) {
			fetchMyRequests(profile.id);
		}
	}, [profile?.id, fetchMyRequests]);

	const filteredRequests = requests.filter((req) => {
		const matchesSearch =
			(req.guide_name?.toLowerCase() || "").includes(
				searchQuery.toLowerCase(),
			) ||
			(req.destinations?.toLowerCase() || "").includes(
				searchQuery.toLowerCase(),
			);

		const matchesStatus =
			statusFilter === "all"
				? true
				: (req.status || "").toLowerCase() === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const pendingCount = requests.filter((r) => r.status === "pending").length;
	const approvedCount = requests.filter(
		(r) => r.status === "approved",
	).length;
	const confirmedCount = requests.filter(
		(r) => r.status === "confirmed",
	).length;

	return (
		<Guard fallbackMessage="bookings page">
			{isLoading && requests.length === 0 ? (
				<div className="min-h-screen flex items-center justify-center bg-background">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-xs text-muted-foreground">
							Loading your bookings...
						</p>
					</div>
				</div>
			) : (
				<main className="min-h-screen bg-background pt-24 pb-16">
					<section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
						<header className="space-y-3">
							<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
								My Bookings
							</h1>
							<p className="max-w-2xl text-sm text-muted-foreground">
								Review your negotiation history, track guide
								responses, and complete bookings.
							</p>
						</header>

						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-xl border bg-card p-4">
								<p className="text-xs text-muted-foreground">
									Pending
								</p>
								<p className="mt-1 text-xl font-semibold text-foreground">
									{pendingCount}
								</p>
							</div>

							<div className="rounded-xl border bg-card p-4">
								<p className="text-xs text-muted-foreground">
									Awaiting your response
								</p>
								<p className="mt-1 text-xl font-semibold text-foreground">
									{approvedCount}
								</p>
							</div>

							<div className="rounded-xl border bg-card p-4">
								<p className="text-xs text-muted-foreground">
									Confirmed
								</p>
								<p className="mt-1 text-xl font-semibold text-foreground">
									{confirmedCount}
								</p>
							</div>
						</div>

						<div className="grid gap-3 md:grid-cols-[1fr_220px]">
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-9"
									placeholder="Search by guide or destination"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</div>

							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}>
								<SelectTrigger>
									<div className="flex items-center gap-2">
										<ListFilter className="h-4 w-4 text-muted-foreground" />
										<SelectValue placeholder="Filter by status" />
									</div>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All statuses
									</SelectItem>
									<SelectItem value="pending">
										Pending
									</SelectItem>
									<SelectItem value="approved">
										Approved
									</SelectItem>
									<SelectItem value="rejected">
										Rejected
									</SelectItem>
									<SelectItem value="confirmed">
										Confirmed
									</SelectItem>
									<SelectItem value="cancelled">
										Cancelled
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertTitle>Unable to load bookings</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<section className="grid grid-cols-1 gap-4">
							{filteredRequests.length > 0 ? (
								filteredRequests.map((req) => (
									<BookingRequestCard
										key={req.id}
										request={req}
										showTourist={false}
									/>
								))
							) : (
								<div className="rounded-xl border border-dashed bg-card p-10 text-center">
									<div className="mx-auto flex max-w-sm flex-col items-center gap-3">
										<Inbox className="h-8 w-8 text-muted-foreground" />
										<p className="text-sm font-medium text-foreground">
											No requests found
										</p>
										<p className="text-xs text-muted-foreground">
											Try a different search or start a
											new request from Trek Dai.
										</p>
										<Badge variant="outline">
											{statusFilter === "all"
												? "All statuses"
												: statusFilter}
										</Badge>
									</div>
								</div>
							)}
						</section>
					</section>
				</main>
			)}
		</Guard>
	);
}
