"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGuideStore } from "@/backend/v2/stores/useGuideStore";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Globe,
	Loader2,
	Mail,
	MapPin,
	MessageSquareText,
	Phone,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Guard } from "@/components/auth/auth-initializer";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";

export default function GuideRequestDetails() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const profile = useAuthStore((state) => state.profile());

	const {
		fetchRequestDetails,
		selectedRequest: request,
		isLoadingDashboard: isLoading,
		respondToRequest,
		error,
	} = useGuideStore();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [totalCost, setTotalCost] = useState<number | "">("");
	const [prepayAmount, setPrepayAmount] = useState<number | "">("");
	const [guideRemarks, setGuideRemarks] = useState("");

	useEffect(() => {
		if (id) {
			fetchRequestDetails(id);
		}
	}, [id, fetchRequestDetails]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleRespond = async (status: "approved" | "rejected") => {
		if (!guideRemarks.trim()) {
			toast.error("Please add remarks before submitting.");
			return;
		}

		if (status === "approved") {
			if (!totalCost || totalCost <= 0) {
				toast.error("Please enter a valid total cost.");
				return;
			}

			if (!prepayAmount || prepayAmount < 0 || prepayAmount > totalCost) {
				toast.error(
					"Prepayment must be valid and cannot be greater than total cost.",
				);
				return;
			}
		}

		setIsSubmitting(true);

		const payload =
			status === "approved"
				? {
						total_cost: Number(totalCost),
						prepay_amount: Number(prepayAmount),
						guide_remarks: guideRemarks,
					}
				: {
						guide_remarks: guideRemarks,
					};

		const success = await respondToRequest(id, status, payload);
		if (success) {
			toast.success(`Request ${status} successfully.`);
			router.push("/guide/requests");
		}

		setIsSubmitting(false);
	};

	if (isLoading && !request) {
		return (
			<main className="min-h-screen bg-background">
				<section className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading request details...
					</div>
				</section>
			</main>
		);
	}

	if (!request) {
		return (
			<main className="min-h-screen bg-background">
				<section className="mx-auto max-w-2xl px-4 py-16">
					<Card className="rounded-xl border p-6 text-center">
						<h1 className="text-xl font-semibold text-foreground">
							Request not found
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							This request may no longer be available.
						</p>
						<Button asChild variant="outline" className="mt-5">
							<Link href="/guide/requests">
								Back to guide dashboard
							</Link>
						</Button>
					</Card>
				</section>
			</main>
		);
	}

	const isGuide = Boolean(profile?.is_guide);
	const hasPendingApplication =
		Boolean(profile?.is_guide_applicantion_pending) && !isGuide;

	if (!isGuide) {
		return (
			<Guard fallbackMessage="guide request details page">
				<main className="min-h-screen bg-background">
					<section className="mx-auto max-w-2xl px-4 py-16">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Guide account required</AlertTitle>
							<AlertDescription>
								You need an approved guide account to view and
								respond to requests.
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
			</Guard>
		);
	}

	const tourist = request.tourist;

	return (
		<Guard fallbackMessage="guide request details page">
			<main className="min-h-screen bg-background">
				<section className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
					<Link
						href="/guide/requests"
						className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
						<ArrowLeft className="h-4 w-4" /> Back to guide
						dashboard
					</Link>

					{error ? (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Request load error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}

					<div className="mb-6 flex items-center gap-3">
						<div className="relative h-14 w-14 overflow-hidden rounded-full border bg-muted">
							<Image
								src={
									tourist.avatar ||
									`https://api.dicebear.com/7.x/avataaars/svg?seed=${tourist.id}`
								}
								alt={tourist.name}
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<h1 className="text-xl font-semibold text-foreground md:text-2xl">
								{tourist.name}
							</h1>
							<p className="text-sm text-muted-foreground">
								Requested on{" "}
								{format(
									new Date(request.created_at),
									"MMMM d, yyyy",
								)}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<section className="space-y-4 lg:col-span-2">
							<Card className="rounded-xl border p-5">
								<CardContent className="grid gap-4 p-0 sm:grid-cols-2">
									<div>
										<p className="text-xs text-muted-foreground">
											Email
										</p>
										<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
											<Mail className="h-3.5 w-3.5" />{" "}
											{tourist.email || "N/A"}
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">
											Phone
										</p>
										<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
											<Phone className="h-3.5 w-3.5" />{" "}
											{tourist.phone_number || "N/A"}
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">
											Country
										</p>
										<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
											<Globe className="h-3.5 w-3.5" />{" "}
											{tourist.country || "N/A"}
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">
											Emergency contact
										</p>
										<p className="mt-1 text-sm text-foreground">
											{tourist.emergency_contact || "N/A"}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="rounded-xl border p-5">
								<CardContent className="space-y-4 p-0">
									<div className="grid gap-4 sm:grid-cols-3">
										<div>
											<p className="text-xs text-muted-foreground">
												Destination
											</p>
											<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
												<MapPin className="h-3.5 w-3.5" />{" "}
												{request.destinations}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">
												People
											</p>
											<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
												<Users className="h-3.5 w-3.5" />{" "}
												{request.people_count}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">
												Duration
											</p>
											<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
												<Calendar className="h-3.5 w-3.5" />{" "}
												{request.duration_days} day(s)
											</p>
										</div>
									</div>

									<div>
										<p className="text-xs text-muted-foreground">
											Additional details
										</p>
										<div className="mt-1 rounded-lg border bg-muted/20 p-3 text-sm text-foreground">
											{request.additional_details ||
												"No additional details provided."}
										</div>
									</div>
								</CardContent>
							</Card>
						</section>

						<aside>
							<Card className="rounded-xl border p-5">
								<CardContent className="space-y-4 p-0">
									{request.status !== "pending" ? (
										<div className="rounded-lg border bg-muted/20 p-4 text-center">
											{request.status === "approved" ? (
												<>
													<CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-primary" />
													<p className="text-sm font-medium text-foreground">
														You approved this
														request
													</p>
												</>
											) : (
												<>
													<XCircle className="mx-auto mb-2 h-6 w-6 text-destructive" />
													<p className="text-sm font-medium text-foreground">
														You rejected this
														request
													</p>
												</>
											)}
										</div>
									) : (
										<>
											<div className="grid gap-3">
												<div>
													<label className="mb-1 block text-xs text-muted-foreground">
														Total cost
													</label>
													<input
														type="number"
														min={0}
														value={totalCost}
														onChange={(event) =>
															setTotalCost(
																Number(
																	event.target
																		.value,
																) || "",
															)
														}
														className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring-2"
														placeholder="0.00"
													/>
												</div>

												<div>
													<label className="mb-1 block text-xs text-muted-foreground">
														Required prepayment
													</label>
													<input
														type="number"
														min={0}
														value={prepayAmount}
														onChange={(event) =>
															setPrepayAmount(
																Number(
																	event.target
																		.value,
																) || "",
															)
														}
														className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring-2"
														placeholder="0.00"
													/>
												</div>

												<div>
													<label className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
														<MessageSquareText className="h-3.5 w-3.5" />{" "}
														Remarks
													</label>
													<textarea
														value={guideRemarks}
														onChange={(event) =>
															setGuideRemarks(
																event.target
																	.value,
															)
														}
														className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-2"
														placeholder="Share your decision and important notes for the tourist."
													/>
												</div>
											</div>

											<div className="grid gap-2">
												<Button
													onClick={() =>
														handleRespond(
															"approved",
														)
													}
													disabled={isSubmitting}
													className="h-10 rounded-md">
													{isSubmitting ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Submitting
														</>
													) : (
														"Approve request"
													)}
												</Button>

												<Button
													onClick={() =>
														handleRespond(
															"rejected",
														)
													}
													disabled={isSubmitting}
													variant="outline"
													className="h-10 rounded-md text-destructive border-destructive/30 hover:bg-destructive/10">
													{isSubmitting ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Submitting
														</>
													) : (
														"Reject request"
													)}
												</Button>
											</div>
										</>
									)}
								</CardContent>
							</Card>
						</aside>
					</div>
				</section>
			</main>
		</Guard>
	);
}
