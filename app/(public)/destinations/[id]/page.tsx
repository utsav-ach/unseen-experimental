"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Loader2,
	MapPin,
	Star,
	Users,
	Package,
	Sparkles,
	BookOpen,
	MessageSquare,
} from "lucide-react";
import { useFeaturedDestinationStore } from "@/backend/v2/stores/useFeaturedDestinationStore";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function DestinationDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = React.use(params);
	const {
		currentDestinationDetails,
		isLoading,
		fetchDestinationDetails,
		clearCurrentDetails,
	} = useFeaturedDestinationStore();

	useEffect(() => {
		fetchDestinationDetails(id);
		return () => clearCurrentDetails();
	}, [id, fetchDestinationDetails, clearCurrentDetails]);

	if (isLoading && !currentDestinationDetails) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">
					Loading destination details...
				</p>
			</div>
		);
	}

	if (!currentDestinationDetails) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background px-4 text-center">
				<h1 className="text-xl font-semibold text-foreground">
					Destination not found
				</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					This destination is unavailable right now.
				</p>
				<Link href="/destinations">
					<Button variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to destinations
					</Button>
				</Link>
			</div>
		);
	}

	const { destination, guides, packages, activities, stories, reviews } =
		currentDestinationDetails;
	const mainImage =
		destination.feature_image ||
		destination.additional_images?.[0] ||
		"/placeholder-destination.jpg";

	return (
		<main className="min-h-screen bg-background pb-16">
			<section className="relative h-[45vh] min-h-75 w-full overflow-hidden">
				<Image
					src={mainImage}
					alt={destination.name}
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
				<div className="absolute left-4 top-4 z-20 md:left-8 md:top-8">
					<Link href="/destinations">
						<Button
							variant="secondary"
							className="bg-background/80 backdrop-blur">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>
				</div>

				<div className="absolute bottom-6 left-0 right-0 z-20 px-4 md:px-8">
					<div className="mx-auto w-full max-w-7xl">
						<div className="inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs text-foreground shadow-sm backdrop-blur">
							<Star className="h-3.5 w-3.5 fill-primary text-primary" />
							{destination.avg_rating
								? destination.avg_rating.toFixed(1)
								: "New"}
						</div>
						<h1 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
							{destination.name}
						</h1>
						<p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
							{destination.description ||
								"Explore this destination with verified guides and curated travel plans."}
						</p>
					</div>
				</div>
			</section>

			<section className="mx-auto mt-8 w-full max-w-7xl space-y-8 px-4 md:px-8">
				<div className="flex flex-wrap items-center gap-2 text-xs">
					{(destination.tags ?? []).slice(0, 6).map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
					<Badge variant="outline" className="gap-1">
						<MapPin className="h-3 w-3" /> {destination.radius} km
						area
					</Badge>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<Card className="p-4">
						<p className="text-xs text-muted-foreground">
							Guides available
						</p>
						<p className="mt-1 text-2xl font-semibold">
							{guides.length}
						</p>
					</Card>
					<Card className="p-4">
						<p className="text-xs text-muted-foreground">
							Related packages
						</p>
						<p className="mt-1 text-2xl font-semibold">
							{packages.length}
						</p>
					</Card>
					<Card className="p-4">
						<p className="text-xs text-muted-foreground">
							Community reviews
						</p>
						<p className="mt-1 text-2xl font-semibold">
							{reviews.length}
						</p>
					</Card>
				</div>

				<section>
					<h2 className="mb-3 text-lg font-semibold">Activities</h2>
					{activities.length ? (
						<div className="flex flex-wrap gap-2">
							{activities.map((activity) => (
								<Badge
									key={activity.id}
									variant="outline"
									className="gap-1">
									<Sparkles className="h-3 w-3" />{" "}
									{activity.name}
								</Badge>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No activities configured for this destination yet.
						</p>
					)}
				</section>

				<section>
					<h2 className="mb-3 text-lg font-semibold">
						Available guides
					</h2>
					{guides.length ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{guides.map((guide) => (
								<Card key={guide.id} className="p-4">
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarImage
												src={guide.avatar_url || ""}
											/>
											<AvatarFallback>
												{guide.full_name?.[0] || "G"}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium text-foreground">
												{guide.full_name}
											</p>
											<p className="text-xs text-muted-foreground">
												{guide.distance_km?.toFixed(1)}{" "}
												km away
											</p>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No guides currently listed in this area.
						</p>
					)}
				</section>

				<section>
					<div className="mb-3 flex items-center justify-between gap-3">
						<h2 className="text-lg font-semibold">
							Packages for this destination
						</h2>
						<Link href="/packages">
							<Button size="sm" variant="outline">
								View all packages
							</Button>
						</Link>
					</div>
					{packages.length ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{packages.map((pkg) => (
								<Link
									key={pkg.id}
									href={`/packages/details/${pkg.id}`}>
									<Card className="h-full p-4">
										<div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
											<Package className="h-3.5 w-3.5" />
											<span>
												{pkg.type ===
												"activities_package"
													? "Activities package"
													: "Destination package"}
											</span>
										</div>
										<p className="line-clamp-1 text-sm font-semibold text-foreground">
											{pkg.name}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											{pkg.total_days} days
										</p>
										<p className="mt-3 text-sm font-medium text-foreground">
											Rs.{" "}
											{Number(
												pkg.discounted_price,
											).toLocaleString()}
										</p>
									</Card>
								</Link>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No direct packages mapped to this destination yet.
						</p>
					)}
				</section>

				<section>
					<h2 className="mb-3 text-lg font-semibold">
						Recent stories
					</h2>
					{stories.length ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{stories.slice(0, 6).map((story) => (
								<Link
									key={story.id}
									href={`/stories/${story.id}`}>
									<Card className="h-full overflow-hidden">
										<div className="relative aspect-4/3">
											<Image
												src={
													story.feature_image ||
													"/placeholder-destination.jpg"
												}
												alt={story.title}
												fill
												className="object-cover"
											/>
										</div>
										<div className="p-4">
											<p className="line-clamp-2 text-sm font-medium text-foreground">
												{story.title}
											</p>
										</div>
									</Card>
								</Link>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No stories have been shared for this destination
							yet.
						</p>
					)}
				</section>

				<section>
					<h2 className="mb-3 text-lg font-semibold">Reviews</h2>
					{reviews.length ? (
						<div className="space-y-3">
							{reviews.slice(0, 8).map((review) => (
								<Card key={review.id} className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-medium text-foreground">
												{review.first_name ||
												review.last_name
													? `${review.first_name ?? ""} ${review.last_name ?? ""}`.trim()
													: review.username ||
														"Traveler"}
											</p>
											<p className="mt-1 text-sm text-muted-foreground">
												{review.review_text ||
													"No written review."}
											</p>
										</div>
										<div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
											<MessageSquare className="h-3.5 w-3.5" />
											<span>
												{review.rating ?? "N/A"}
											</span>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No reviews yet for this destination.
						</p>
					)}
				</section>
			</section>
		</main>
	);
}
