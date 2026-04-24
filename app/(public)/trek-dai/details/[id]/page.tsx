"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useGuideStore } from "@/backend/v2/stores/useGuideStore";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GFMRender } from "@/components/ui/gfm-render";
import { NegotiationDialog } from "@/components/bookings/negotiation-dialog";

export default function GuideDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { currentGuide, isLoading, error, fetchGuideDetail } =
		useGuideStore();

	useEffect(() => {
		if (!id) return;
		fetchGuideDetail(id);
	}, [fetchGuideDetail, id]);

	const guide = currentGuide;

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!guide) {
		return (
			<main className="min-h-screen bg-background p-6 md:p-10">
				<div className="mx-auto max-w-4xl space-y-6">
					{error ? (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>
								Could not load guide details
							</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}

					<div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
						<h2 className="text-xl font-semibold text-foreground">
							Guide not found
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							The guide might be unavailable or the link is no
							longer valid.
						</p>
						<Button asChild variant="outline" className="mt-6">
							<Link href="/trek-dai">Back to guides</Link>
						</Button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background border-t">
			<div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
				<Link
					href="/trek-dai"
					className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
					<ArrowLeft className="h-4 w-4" /> Back to Guides
				</Link>

				{error ? (
					<Alert variant="destructive" className="mb-6">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Some data may be incomplete</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				<section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<aside className="space-y-5">
						<div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border">
							<Image
								src={
									guide.avatar_url ||
									`https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.id}`
								}
								alt={guide.full_name}
								fill
								className="object-cover"
							/>
						</div>

						<div className="space-y-3 rounded-xl border bg-card p-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Rating
								</span>
								<span className="flex items-center gap-1 font-medium text-foreground">
									<Star className="h-3 w-3 fill-primary text-primary" />{" "}
									{guide.avg_rating}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Reviews
								</span>
								<span className="font-medium text-foreground">
									{guide.reviews?.length || 0}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Status
								</span>
								<span
									className={cn(
										"text-xs font-medium uppercase tracking-wide",
										guide.is_available
											? "text-primary"
											: "text-muted-foreground",
									)}>
									{guide.is_available
										? "Available"
										: "Unavailable"}
								</span>
							</div>
						</div>

						<div className="space-y-3">
							<h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Languages
							</h4>
							<div className="flex flex-wrap gap-2">
								{guide.known_languages.map((lang) => (
									<Badge
										key={lang}
										variant="secondary"
										className="rounded-md text-xs font-normal">
										{lang}
									</Badge>
								))}
							</div>
						</div>
					</aside>

					<article className="space-y-8 lg:col-span-2">
						<header className="space-y-4 border-b pb-6">
							<h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
								{guide.full_name}
							</h1>
							<div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span>
									{guide.service_areas?.[0]?.location_name ||
										"Nepal"}
								</span>
							</div>
						</header>

						<section className="space-y-3">
							<h2 className="text-lg font-semibold text-foreground">
								About
							</h2>
							<div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
								<GFMRender
									content={
										guide.description ||
										"No description provided."
									}
								/>
							</div>
						</section>

						{guide.previous_experience ? (
							<section className="space-y-3">
								<h2 className="text-lg font-semibold text-foreground">
									Experience
								</h2>
								<div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
									<GFMRender
										content={guide.previous_experience}
									/>
								</div>
							</section>
						) : null}

						{guide.service_areas &&
						guide.service_areas.length > 0 ? (
							<section className="space-y-3">
								<h2 className="text-lg font-semibold text-foreground">
									Service areas
								</h2>
								<div className="flex flex-wrap gap-2">
									{guide.service_areas.map((area) => (
										<Badge
											key={area.id}
											variant="outline"
											className="rounded-md text-xs font-normal">
											{area.location_name}
										</Badge>
									))}
								</div>
							</section>
						) : null}

						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-foreground">
								Reviews
							</h2>
							{guide.reviews && guide.reviews.length > 0 ? (
								<div className="space-y-3">
									{guide.reviews.map((review) => (
										<article
											key={review.id}
											className="space-y-2 rounded-xl border bg-card p-4">
											<div className="flex items-center justify-between">
												<p className="text-sm font-medium text-foreground">
													{review.reviewer?.name ||
														"Traveler"}
												</p>
												<div className="flex items-center gap-1 text-sm text-foreground">
													<Star className="h-3 w-3 fill-primary text-primary" />
													<span>{review.rating}</span>
												</div>
											</div>
											<p className="text-sm text-muted-foreground">
												{review.review_text ||
													"No written review."}
											</p>
										</article>
									))}
								</div>
							) : (
								<p className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
									No reviews yet.
								</p>
							)}
						</section>

						<section className="border-t pt-6">
							<NegotiationDialog
								guideId={guide.id}
								guideName={guide.full_name}>
								<Button
									className="h-11 rounded-lg px-6"
									disabled={!guide.is_available}>
									Start negotiation
								</Button>
							</NegotiationDialog>
						</section>
					</article>
				</section>
			</div>
		</main>
	);
}
