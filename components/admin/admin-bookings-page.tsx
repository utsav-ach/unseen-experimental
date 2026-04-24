"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AdminBookingsPage() {
	const { bookingOps, isLoading, error, fetchBookingOperations } =
		useAdminStore();

	useEffect(() => {
		void fetchBookingOperations();
	}, [fetchBookingOperations]);

	return (
		<div>
			<AdminPageHeader
				title="Bookings & Negotiations"
				description="Monitor requests and finalized bookings from one operational panel."
				action={
					<Button
						variant="outline"
						onClick={() => void fetchBookingOperations()}
						disabled={isLoading}>
						Refresh
					</Button>
				}
			/>

			{error ? (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>Booking monitor failed</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Booking Requests
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{(bookingOps?.booking_requests || []).map((item) => (
							<div
								key={item.id}
								className="rounded-md border border-border p-3 text-sm">
								<p className="font-medium text-foreground">
									{item.destinations}
								</p>
								<p className="text-xs text-muted-foreground">
									{item.tourist_name || "Unknown tourist"} →{" "}
									{item.guide_name || "Unknown guide"} •{" "}
									{item.status}
								</p>
							</div>
						))}
						{!bookingOps?.booking_requests?.length && !isLoading ? (
							<p className="text-sm text-muted-foreground">
								No booking requests found.
							</p>
						) : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Finalized Bookings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{(bookingOps?.bookings || []).map((item) => (
							<div
								key={item.id}
								className="rounded-md border border-border p-3 text-sm">
								<p className="font-medium text-foreground">
									{item.destination_name ||
										"Custom destination"}
								</p>
								<p className="text-xs text-muted-foreground">
									{item.tourist_name || "Unknown tourist"} →{" "}
									{item.guide_name || "Unknown guide"} •{" "}
									{item.status}
								</p>
							</div>
						))}
						{!bookingOps?.bookings?.length && !isLoading ? (
							<p className="text-sm text-muted-foreground">
								No finalized bookings found.
							</p>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
