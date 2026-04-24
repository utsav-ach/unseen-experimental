"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import {
	CheckCircle2,
	Clock,
	Eye,
	EyeOff,
	Loader2,
	ShieldAlert,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useGuideApplicationStore } from "@/backend/v2/stores/useGuideApplicationStore";
import { Guard } from "@/components/auth/auth-initializer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ApplicationStatusPage() {
	const profile = useAuthStore((state) => state.profile());
	const {
		fetchMyApplications,
		myApplications,
		isLoading,
		error,
		signedUrls,
		loadProofUrl,
		clearHistory,
	} = useGuideApplicationStore();

	const [showIdNumber, setShowIdNumber] = useState(false);
	const [showPhoto, setShowPhoto] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (profile?.id) {
			fetchMyApplications();
		}
	}, [profile, fetchMyApplications]);

	useEffect(() => {
		const init = async () => {
			await fetchMyApplications();
			setIsInitialized(true);
		};
		init();
	}, [fetchMyApplications]);

	const latestApp = useMemo(() => myApplications[0], [myApplications]);

	const statusMap = {
		pending: {
			label: "Pending",
			icon: Clock,
			className: "text-amber-600 dark:text-amber-400",
			badgeClass:
				"border-amber-500/30 text-amber-600 dark:text-amber-400",
		},
		approved: {
			label: "Approved",
			icon: CheckCircle2,
			className: "text-primary",
			badgeClass: "border-primary/30 text-primary",
		},
		rejected: {
			label: "Rejected",
			icon: XCircle,
			className: "text-destructive",
			badgeClass: "border-destructive/30 text-destructive",
		},
	};

	const config = latestApp
		? statusMap[latestApp.status as keyof typeof statusMap]
		: null;

	const handleViewPhoto = async () => {
		if (!latestApp?.nid_photo_url) return;
		if (!showPhoto) {
			await loadProofUrl(latestApp.nid_photo_url);
		}
		setShowPhoto((prev) => !prev);
	};

	if (!isInitialized || isLoading) {
		return (
			<main className="min-h-screen bg-background">
				<section className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading application status...
					</div>
				</section>
			</main>
		);
	}

	if (!latestApp && !profile?.is_guide) {
		return (
			<main className="min-h-screen bg-background">
				<section className="mx-auto max-w-2xl px-4 py-16">
					<Card className="space-y-4 rounded-xl border p-6 text-center">
						<ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
						<h1 className="text-xl font-semibold text-foreground">
							No guide application found
						</h1>
						<p className="text-sm text-muted-foreground">
							You do not have an active guide application. Submit
							your registration to continue.
						</p>
						<Button asChild onClick={clearHistory}>
							<Link href="/guide/register">
								Start registration
							</Link>
						</Button>
					</Card>
				</section>
			</main>
		);
	}

	return (
		<Guard fallbackMessage="guide application status page">
			<main className="min-h-screen bg-background">
				<section className="border-b bg-muted/20">
					<div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-10 md:py-12">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
							Application status
						</h1>
						<p className="text-sm text-muted-foreground">
							Track your guide registration and review admin
							feedback.
						</p>
					</div>
				</section>

				<section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 md:py-10">
					{error ? (
						<Alert variant="destructive">
							<AlertTitle>Status load error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}

					{latestApp && config ? (
						<Card className="space-y-5 rounded-xl border p-5 md:p-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3">
									<config.icon
										className={cn(
											"h-5 w-5",
											config.className,
										)}
									/>
									<div>
										<h2 className="text-lg font-semibold text-foreground">
											Guide application
										</h2>
										<p className="text-sm text-muted-foreground">
											Submitted{" "}
											{latestApp.created_at
												? format(
														new Date(
															latestApp.created_at,
														),
														"MMMM d, yyyy",
													)
												: "-"}
										</p>
									</div>
								</div>
								<Badge
									variant="outline"
									className={cn(
										"rounded-md",
										config.badgeClass,
									)}>
									{config.label}
								</Badge>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-lg border bg-card p-4">
									<p className="text-xs text-muted-foreground">
										Document type
									</p>
									<p className="mt-1 text-sm font-medium capitalize text-foreground">
										{latestApp.nid_document_type || "-"}
									</p>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<div className="flex items-center justify-between gap-3">
										<p className="text-xs text-muted-foreground">
											Document number
										</p>
										<button
											type="button"
											onClick={() =>
												setShowIdNumber((prev) => !prev)
											}
											className="text-muted-foreground hover:text-foreground">
											{showIdNumber ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
									<p className="mt-1 text-sm font-medium text-foreground">
										{showIdNumber
											? latestApp.nid_number
											: "•••• •••• ••••"}
									</p>
								</div>
							</div>

							<div className="space-y-2 rounded-lg border bg-muted/20 p-4">
								<p className="text-xs text-muted-foreground">
									Admin feedback
								</p>
								<p className="text-sm text-foreground">
									{latestApp.admin_feedback ||
										"No admin feedback yet. Your application is under review."}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-medium text-foreground">
										Document preview
									</p>
									<Button
										variant="outline"
										onClick={handleViewPhoto}
										className="h-9 rounded-md px-4 text-xs">
										{showPhoto ? "Hide" : "Show"} document
									</Button>
								</div>

								{showPhoto ? (
									<div className="relative h-64 w-full overflow-hidden rounded-lg border bg-card md:h-80">
										{latestApp.nid_photo_url &&
										signedUrls[latestApp.nid_photo_url] ? (
											<Image
												src={
													signedUrls[
														latestApp.nid_photo_url
													]
												}
												alt="ID document"
												fill
												className="object-contain"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Loading secure preview...
											</div>
										)}
									</div>
								) : (
									<div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
										Document preview hidden
									</div>
								)}
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								{profile?.is_guide ? (
									<Button
										asChild
										className="h-10 rounded-md px-5">
										<Link href="/guide/requests">
											Go to guide dashboard
										</Link>
									</Button>
								) : null}
								{latestApp.status === "rejected" ? (
									<Button
										asChild
										variant="outline"
										className="h-10 rounded-md px-5">
										<Link href="/guide/register">
											Submit New application
										</Link>
									</Button>
								) : null}
							</div>
						</Card>
					) : null}
				</section>
			</main>
		</Guard>
	);
}
