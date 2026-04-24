"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBookingRequestStore } from "@/backend/v2/stores/useBookingRequestStore";
import {
	ArrowLeft,
	MapPin,
	Users,
	Calendar,
	Loader2,
	MessageSquare,
	CreditCard,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Guard } from "@/components/auth/auth-initializer";
import Image from "next/image";
import { RequestStatusBadge } from "@/components/bookings/status-badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function TouristBookingDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();

	const {
		fetchRequestDetailForTourist,
		currentRequest: request,
		isLoading,
		finalizeRequest,
		setTemporaryRemarks,
		error,
	} = useBookingRequestStore();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [touristRemarks, setTouristRemarks] = useState("");

	useEffect(() => {
		if (id) {
			fetchRequestDetailForTourist(id);
		}
	}, [id, fetchRequestDetailForTourist]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleReject = async () => {
		if (!touristRemarks.trim()) {
			toast.error("Please provide a reason for declining these terms.");
			return;
		}
		setIsSubmitting(true);
		const success = await finalizeRequest(id, "cancelled", {
			remarks: touristRemarks,
		});
		if (success) {
			toast.success("Proposal declined successfully.");
			router.push("/bookings");
		}
		setIsSubmitting(false);
	};

	const handleProceedToCheckout = () => {
		if (!touristRemarks.trim()) {
			toast.error(
				"Please add a short note for the guide before proceeding.",
			);
			return;
		}
		setTemporaryRemarks(touristRemarks);
		router.push(`/bookings/checkout/${id}`);
	};

	if (isLoading && !request) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (!request) return null;

	const guide = request.guide as any;
	const hasStatusAction = request.status === "approved";
	const isConfirmed = request.status === "confirmed";
	const isClosed =
		request.status === "cancelled" || request.status === "rejected";

	return (
		<Guard fallbackMessage="booking details page">
			<main className="min-h-screen bg-background pb-16 pt-24">
				<section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="w-fit">
							<Link
								href="/bookings"
								className="inline-flex items-center gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back to requests
							</Link>
						</Button>
						<RequestStatusBadge status={request.status} />
					</div>

					<header className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Booking negotiation details
						</h1>
						<p className="text-sm text-muted-foreground">
							Review guide terms and choose whether to continue or
							cancel this request.
						</p>
					</header>

					{error && (
						<Alert variant="destructive">
							<AlertTitle>Could not load request</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{isConfirmed && (
						<Alert>
							<CheckCircle2 className="h-4 w-4" />
							<AlertTitle>Booking confirmed</AlertTitle>
							<AlertDescription>
								Your booking for {request.destinations} with{" "}
								{guide?.full_name || "the guide"} is confirmed.
							</AlertDescription>
						</Alert>
					)}

					{isClosed && (
						<Alert>
							<XCircle className="h-4 w-4" />
							<AlertTitle>Negotiation closed</AlertTitle>
							<AlertDescription>
								This request is already {request.status}. You
								can create a new request from Trek Dai.
							</AlertDescription>
						</Alert>
					)}

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="rounded-xl border bg-card p-5">
							<div className="flex items-center gap-3">
								<div className="relative h-12 w-12 overflow-hidden rounded-full border bg-muted">
									{guide?.avatar_url ? (
										<Image
											src={guide.avatar_url}
											alt={guide?.full_name || "Guide"}
											fill
											className="object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
											{(guide?.full_name || "G")[0]}
										</div>
									)}
								</div>
								<div>
									<p className="text-xs text-muted-foreground">
										Guide
									</p>
									<p className="text-sm font-medium text-foreground">
										{guide?.full_name ||
											"Professional guide"}
									</p>
								</div>
							</div>

							<Separator className="my-4" />

							<dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
								<div>
									<dt className="text-muted-foreground">
										Destination
									</dt>
									<dd className="mt-1 inline-flex items-center gap-1 text-foreground">
										<MapPin className="h-3.5 w-3.5" />
										{request.destinations || "Unspecified"}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">
										Duration
									</dt>
									<dd className="mt-1 inline-flex items-center gap-1 text-foreground">
										<Calendar className="h-3.5 w-3.5" />
										{request.duration_days || 1} day(s)
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">
										People
									</dt>
									<dd className="mt-1 inline-flex items-center gap-1 text-foreground">
										<Users className="h-3.5 w-3.5" />
										{request.people_count || 1}
									</dd>
								</div>
							</dl>
						</Card>

						<Card className="rounded-xl border bg-card p-5">
							<h2 className="text-sm font-semibold text-foreground">
								Guide terms
							</h2>
							<p className="mt-3 text-xs text-muted-foreground">
								Guide remarks
							</p>
							<p className="mt-1 text-sm text-foreground">
								{request.guide_remarks ||
									"No extra notes provided by the guide yet."}
							</p>

							<Separator className="my-4" />

							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Total fee
									</span>
									<span className="font-medium text-foreground">
										${request.total_cost || "--"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Required prepayment
									</span>
									<span className="font-medium text-foreground">
										${request.prepay_amount || "--"}
									</span>
								</div>
							</div>
						</Card>
					</div>

					{!isConfirmed && !isClosed && (
						<Card className="rounded-xl border bg-card p-5">
							<div className="space-y-4">
								<div className="space-y-1">
									<Label htmlFor="tourist-remarks">
										Your remarks
									</Label>
									<p className="text-xs text-muted-foreground">
										This message is shared with the guide.
									</p>
								</div>

								<textarea
									id="tourist-remarks"
									value={touristRemarks}
									onChange={(e) =>
										setTouristRemarks(e.target.value)
									}
									placeholder={
										hasStatusAction
											? "Add a short note before proceeding to checkout"
											: "Guide has not sent final terms yet"
									}
									disabled={
										request.status === "pending" ||
										isSubmitting
									}
									className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
								/>

								{hasStatusAction ? (
									<div className="grid gap-3 sm:grid-cols-2">
										<Button
											onClick={handleProceedToCheckout}
											disabled={isSubmitting}
											className="inline-flex items-center gap-2">
											<CreditCard className="h-4 w-4" />
											Proceed to checkout
										</Button>
										<Button
											variant="destructive"
											onClick={handleReject}
											disabled={isSubmitting}>
											Cancel negotiation
										</Button>
									</div>
								) : (
									<Alert>
										<MessageSquare className="h-4 w-4" />
										<AlertTitle>
											Waiting for guide response
										</AlertTitle>
										<AlertDescription>
											Your guide has not submitted pricing
											terms yet.
										</AlertDescription>
									</Alert>
								)}
							</div>
						</Card>
					)}
				</section>
			</main>
		</Guard>
	);
}
