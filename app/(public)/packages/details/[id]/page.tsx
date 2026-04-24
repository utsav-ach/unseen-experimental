"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PackageOpen } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { usePackageStore } from "@/backend/v2/stores/usePackageStore";
import { PackageCard } from "@/components/packages/PackageCard";
import { Card } from "@/components/ui/card";
import { PackageImageGallery } from "@/components/packages/details/package-image-gallery";
import { PackageActivitiesList } from "@/components/packages/details/package-activities-list";
import { PackageItinerary } from "@/components/packages/details/package-itinerary";
import { PackageHighlights } from "@/components/packages/details/package-highlights";
import { PackageInclusions } from "@/components/packages/details/package-inclusions";
import { PackageBookingActions } from "@/components/packages/details/package-booking-actions";
import { PackageInfoGrid } from "@/components/packages/details/package-info-grid";

export default function PackageDetailsPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const {
		currentPackage,
		featuredPackages,
		isLoading,
		fetchPackageDetails,
		fetchFeaturedPackages,
		error,
	} = usePackageStore();

	useEffect(() => {
		if (id) {
			fetchPackageDetails(id);
			fetchFeaturedPackages();
		}
	}, [id, fetchPackageDetails, fetchFeaturedPackages]);

	if (isLoading && !currentPackage) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
					<Card className="w-full max-w-xl rounded-xl border bg-card p-6 text-center">
						<PackageOpen className="mx-auto mb-4 h-10 w-10 text-destructive" />
						<h1 className="text-lg font-semibold text-foreground">
							Package details unavailable
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							{error}
						</p>
						<Link href="/packages" className="mt-6 inline-flex">
							<Button variant="outline">Back to packages</Button>
						</Link>
					</Card>
				</main>
			</div>
		);
	}

	if (!currentPackage) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
					<Card className="w-full max-w-xl rounded-lg border bg-card p-6 text-center">
						<PackageOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
						<h1 className="text-lg font-semibold text-foreground">
							Package not found
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							This package is unavailable right now.
						</p>
						<Link href="/packages" className="mt-6 inline-flex">
							<Button variant="outline">Back to packages</Button>
						</Link>
					</Card>
				</main>
			</div>
		);
	}

	const {
		package: pkg,
		destination_covered,
		additional_activities_included,
		main_activity,
	} = currentPackage;
	const relatedPackages = featuredPackages
		.filter((item) => item.id !== id)
		.slice(0, 3);

	const handleBooking = () => {
		router.push(`/bookings/checkout/${id}?type=package`);
	};

	const handleWhatsapp = () => {
		const message = `Hi, I'm interested in the ${pkg.name} package. Can you provide more details?`;
		const encodedMessage = encodeURIComponent(message);
		window.open(`https://wa.me/977?text=${encodedMessage}`, "_blank");
	};

	const highlights = [
		"Experience breathtaking mountain views",
		"Visit sacred temples and cultural sites",
		"Guided route planning and local support",
		"Direct package booking with fixed pricing",
	];

	const packageImages = [
		pkg.featured_image,
		...(pkg.additional_images ?? []),
	].filter((img): img is string => Boolean(img));
	const mergedActivities = main_activity
		? [
				main_activity,
				...additional_activities_included.filter(
					(act) => act.id !== main_activity.id,
				),
			]
		: additional_activities_included;

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
				<Link
					href="/packages"
					className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
					<ArrowLeft className="h-3 w-3" />
					Back to packages
				</Link>

				{/* Hero Section with Gallery */}
				<div className="mt-8 space-y-6">
					<PackageImageGallery
						images={packageImages}
						packageName={pkg.name}
					/>
				</div>

				{/* Package Header */}
				<div className="mt-8 space-y-3">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						{pkg.name}
					</h1>
					<p className="text-base leading-relaxed text-muted-foreground max-w-3xl">
						{pkg.description ||
							"Embark on a carefully curated journey through Nepal's most breathtaking landscapes with professional guides and comfortable accommodations."}
					</p>
				</div>

				{/* Key Info Grid */}
				<div className="mt-8">
					<PackageInfoGrid
						duration={pkg.total_days}
						packageType={pkg.type}
						destination={destination_covered?.name}
					/>
				</div>

				{/* Main Content Grid */}
				<div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* Left Column - Details */}
					<div className="space-y-6 lg:col-span-2">
						<PackageItinerary travelRoutes={pkg.travel_routes} />

						<PackageHighlights highlights={highlights} />

						{mergedActivities.length > 0 && (
							<section className="space-y-4 rounded-lg border bg-card p-6">
								<h3 className="text-lg font-semibold text-foreground">
									Included activities
								</h3>
								<PackageActivitiesList
									activities={mergedActivities}
								/>
							</section>
						)}

						<PackageInclusions />
					</div>

					{/* Right Column - Booking */}
					<div className="space-y-6">
						{/* Price and Basic Info Card */}
						<section className="space-y-4 rounded-lg border bg-card p-6">
							<div className="space-y-3">
								<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
									Package price
								</p>
								<div className="flex items-baseline gap-3">
									<span className="text-3xl font-bold text-foreground">
										Rs.{" "}
										{pkg.discounted_price.toLocaleString()}
									</span>
									{pkg.actual_price >
										pkg.discounted_price && (
										<span className="text-sm text-muted-foreground line-through">
											Rs.{" "}
											{pkg.actual_price.toLocaleString()}
										</span>
									)}
								</div>
								{pkg.actual_price > pkg.discounted_price && (
									<p className="text-xs text-primary font-medium">
										Save Rs.{" "}
										{(
											pkg.actual_price -
											pkg.discounted_price
										).toLocaleString()}
									</p>
								)}
							</div>
						</section>

						{/* CTA Buttons */}
						<PackageBookingActions
							onBook={handleBooking}
							onMessage={handleWhatsapp}
						/>

						{/* Related Packages */}
						{relatedPackages.length > 0 && (
							<section className="space-y-3">
								<h4 className="text-sm font-semibold text-foreground">
									Similar packages
								</h4>
								<div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
									{relatedPackages.map((item) => (
										<div
											key={item.id}
											className="shrink-0 w-80">
											<PackageCard packageItem={item} />
										</div>
									))}
								</div>
							</section>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
