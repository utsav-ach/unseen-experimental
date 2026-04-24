"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	Search,
	PackageOpen,
	Loader2,
	Sparkles,
	ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PackageCard } from "@/components/packages/PackageCard";
import { usePackageStore } from "@/backend/v2/stores/usePackageStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDebounce } from "use-debounce";
import Link from "next/link";

export default function PackagesPage() {
	const { featuredPackages, isLoading, fetchFeaturedPackages, error } =
		usePackageStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch] = useDebounce(searchQuery, 300);

	useEffect(() => {
		fetchFeaturedPackages();
	}, [fetchFeaturedPackages]);

	const filteredPackages = useMemo(() => {
		const query = debouncedSearch.trim().toLowerCase();

		if (!query) return featuredPackages;

		return featuredPackages.filter((pkg) => {
			return (
				pkg.name.toLowerCase().includes(query) ||
				pkg.destination_name?.toLowerCase().includes(query)
			);
		});
	}, [featuredPackages, debouncedSearch]);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
				<section className="grid gap-6 rounded-xl border bg-muted/20 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
							<Sparkles className="h-3.5 w-3.5 text-primary" />
							Direct booking packages
						</div>

						<div className="max-w-2xl space-y-3">
							<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
								Simple travel packages for easy booking.
							</h1>
							<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
								Choose a ready-made package, review the route
								and pricing, and book without negotiation.
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span className="rounded-full border bg-background px-3 py-1.5">
								Fixed pricing
							</span>
							<span className="rounded-full border bg-background px-3 py-1.5">
								Preplanned routes
							</span>
							<span className="rounded-full border bg-background px-3 py-1.5">
								Fast booking
							</span>
						</div>
					</div>

					<Card className="rounded-xl border bg-card p-4 sm:p-5">
						<div className="space-y-4">
							<div>
								<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
									Find a package
								</p>
								<div className="relative mt-3">
									<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Search by package or destination"
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
										className="h-11 border-border bg-background pl-10"
									/>
								</div>
							</div>

							<Link href="/destinations" className="block">
								<Button
									variant="outline"
									className="h-11 w-full justify-between">
									Browse destinations instead
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
						</div>
					</Card>
				</section>

				{/* Packages Grid */}
				{isLoading ? (
					<div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="space-y-3">
								<div className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
								<div className="space-y-2">
									<div className="h-4 w-2/3 rounded bg-muted" />
									<div className="h-3 w-1/2 rounded bg-muted" />
									<div className="h-3 w-full rounded bg-muted" />
								</div>
							</div>
						))}
					</div>
				) : error ? (
					<div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
						{error}
					</div>
				) : filteredPackages.length > 0 ? (
					<div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{filteredPackages.map((pkg) => (
							<PackageCard key={pkg.id} packageItem={pkg} />
						))}
					</div>
				) : (
					<div className="mt-8 flex min-h-[36vh] flex-col items-center justify-center rounded-xl border bg-muted/10 px-6 py-16 text-center">
						<PackageOpen className="mb-4 h-12 w-12 text-muted-foreground" />
						<h2 className="text-lg font-semibold text-foreground">
							No packages found
						</h2>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							Try a different search term or check back later when
							more packages are added.
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
