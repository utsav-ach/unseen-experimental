"use client";

import { useEffect, useState, useMemo } from "react";
import {
	Search,
	SlidersHorizontal,
	Map as MapIcon,
	Filter,
	SearchX,
} from "lucide-react";
import { useFeaturedDestinationStore } from "@/backend/v2/stores/useFeaturedDestinationStore";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectionMap, SelectionPin } from "@/components/map/selection-map";
import { useDebounce } from "use-debounce";
import DestinationGridCard from "@/components/destinations/destination-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TopPackages from "@/components/home-page/TopPackages";

export default function DestinationsPage() {
	const { destinations, isLoading, fetchDestinations, fetchByAreas, error } =
		useFeaturedDestinationStore();

	// UI States
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch] = useDebounce(searchQuery, 400);
	const [ratingSort, setRatingSort] = useState<"desc" | "asc">("desc");
	const [showMapSearch, setShowMapSearch] = useState(false);
	const [selectedZones, setSelectedZones] = useState<SelectionPin[]>([]);

	useEffect(() => {
		if (selectedZones.length > 0 && showMapSearch) {
			fetchByAreas(selectedZones);
		} else {
			fetchDestinations();
		}
	}, [fetchDestinations, fetchByAreas, selectedZones, showMapSearch]);

	// Filtering and Sorting Logic
	const filteredDestinations = useMemo(() => {
		let result = [...destinations];

		// Text Search
		if (debouncedSearch) {
			const query = debouncedSearch.toLowerCase();
			result = result.filter(
				(d) =>
					d.name.toLowerCase().includes(query) ||
					d.tags?.some((t) => t.toLowerCase().includes(query)) ||
					d.description?.toLowerCase().includes(query),
			);
		}

		// Sorting
		result.sort((a, b) => {
			const rA = Number(a.avg_rating) || 0;
			const rB = Number(b.avg_rating) || 0;
			return ratingSort === "desc" ? rB - rA : rA - rB;
		});

		return result;
	}, [destinations, debouncedSearch, ratingSort]);

	const clearMapFilter = () => {
		setSelectedZones([]);
		setShowMapSearch(false);
		fetchDestinations(true);
	};

	return (
		<main className="min-h-screen bg-background pb-16">
			<section className="border-b bg-muted/20">
				<div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
					<div className="max-w-3xl">
						<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							Featured destinations
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
							Explore destinations added by our admins, sort them
							by rating, and filter the list by map area when you
							want a more local search.
						</p>
					</div>

					<div className="mt-8 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search by name, tag, or description"
								className="h-11 border-border bg-background pl-10"
							/>
						</div>

						<Select
							value={ratingSort}
							onValueChange={(value) =>
								setRatingSort(value as "asc" | "desc")
							}>
							<SelectTrigger className="h-11 border-border bg-background">
								<SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
								<SelectValue placeholder="Sort" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="desc">
									Highest rated
								</SelectItem>
								<SelectItem value="asc">
									Lowest rated
								</SelectItem>
							</SelectContent>
						</Select>

						<Button
							variant={showMapSearch ? "default" : "outline"}
							className={cn(
								"h-11 px-5",
								showMapSearch ? "" : "bg-background",
							)}
							onClick={() => setShowMapSearch((value) => !value)}>
							<MapIcon className="mr-2 h-4 w-4" />
							{showMapSearch ? "Hide map" : "Filter on map"}
						</Button>
					</div>

					<AnimatePresence>
						{showMapSearch && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-6 overflow-hidden">
								<Card className="rounded-xl border bg-card p-4 sm:p-5">
									<p className="mb-4 text-sm text-muted-foreground">
										Select one or more areas on the map to
										limit destinations to those service
										zones.
									</p>
									<SelectionMap
										onPinsChange={(pins) =>
											setSelectedZones(pins)
										}
										className="h-[420px] overflow-hidden rounded-xl border"
									/>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</section>

			<section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="mb-6 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Filter className="h-4 w-4" />
						<span>
							{filteredDestinations.length} destinations found
						</span>
					</div>

					{showMapSearch && selectedZones.length > 0 && (
						<Button
							variant="ghost"
							className="w-fit px-0 text-sm text-muted-foreground"
							onClick={clearMapFilter}>
							Clear map filter
						</Button>
					)}
				</div>

				{error && (
					<div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
						{error}
					</div>
				)}

				{isLoading ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array(8)
							.fill(0)
							.map((_, i) => (
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
				) : filteredDestinations.length === 0 ? (
					<div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border bg-muted/10 px-6 py-16 text-center">
						<SearchX className="mb-4 h-12 w-12 text-muted-foreground" />
						<h2 className="text-lg font-semibold text-foreground">
							No destinations found
						</h2>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							Try a wider search, change the sorting, or turn off
							the map filter to see more results.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredDestinations.map((destination, index) => (
							<motion.div
								key={destination.id}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.35,
									delay: index * 0.03,
								}}>
								<DestinationGridCard
									destination={destination}
								/>
							</motion.div>
						))}
					</div>
				)}
			</section>

			<TopPackages />
		</main>
	);
}
