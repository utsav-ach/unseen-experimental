"use client";

import React, { useEffect, useState } from "react";
import { useTrekDaiStore } from "@/backend/v2/stores/useTrekDaiStore";
import { GuideCard } from "@/components/trek-dai/guide-card";
import { AlertTriangle, Loader2, SearchX } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrekDaiPage() {
	const {
		guides,
		total,
		isLoading,
		error,
		query,
		setQuery,
		sortBy,
		setSortBy,
		fetchTrekDaiData,
		loadMore,
	} = useTrekDaiStore();

	const [searchInput, setSearchInput] = useState(query);
	const [debouncedQuery] = useDebounce(searchInput, 500);

	useEffect(() => {
		fetchTrekDaiData();
	}, [fetchTrekDaiData]);

	useEffect(() => {
		if (debouncedQuery !== query) {
			setQuery(debouncedQuery);
		}
	}, [debouncedQuery, query, setQuery]);

	const hasInitialLoading = isLoading && guides.length === 0;

	return (
		<main className="min-h-screen bg-background pb-16">
			<section className="border-b bg-muted/20">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 md:px-8 md:py-16">
					<header className="max-w-3xl space-y-3">
						<h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
							Find a local Trek-Dai guide
						</h1>
						<p className="text-sm text-muted-foreground md:text-base">
							Browse approved and available guides, compare
							ratings, and start booking negotiation.
						</p>
					</header>

					<div className="grid gap-3 rounded-xl border bg-card p-3 md:grid-cols-[1fr_220px]">
						<Input
							value={searchInput}
							onChange={(event) =>
								setSearchInput(event.target.value)
							}
							placeholder="Search by guide name, place, or destination"
							aria-label="Search guides"
							className="h-11 rounded-lg"
						/>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="h-11 w-full rounded-lg border-input bg-background">
								<SelectValue placeholder="Sort" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="rating">
									Top rated
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</section>

			<section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
				<div className="mb-6 flex items-center justify-between border-b pb-4">
					<h2 className="text-sm font-medium text-muted-foreground">
						{hasInitialLoading
							? "Loading guides..."
							: `${total} guide${total === 1 ? "" : "s"} found`}
					</h2>
				</div>

				{error ? (
					<Alert variant="destructive" className="mb-6">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Could not load guides</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				{hasInitialLoading ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={index}
								className="overflow-hidden rounded-xl border">
								<Skeleton className="aspect-[4/3] rounded-none" />
								<div className="space-y-3 p-4">
									<Skeleton className="h-5 w-2/3" />
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-9 w-full" />
								</div>
							</div>
						))}
					</div>
				) : guides.length === 0 ? (
					<div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
						<SearchX className="mb-4 h-10 w-10 text-muted-foreground" />
						<h3 className="text-lg font-medium text-foreground">
							No guides matched your search
						</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Try a different name, place, or destination keyword.
						</p>
					</div>
				) : (
					<div className="space-y-8">
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{guides.map((guide) => (
								<article key={guide.id}>
									<GuideCard guide={guide} />
								</article>
							))}
						</div>

						{guides.length < total ? (
							<div className="flex justify-center">
								<Button
									onClick={loadMore}
									disabled={isLoading}
									variant="outline"
									className="h-11 rounded-lg px-6">
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Loading
										</>
									) : (
										`Load more (${total - guides.length} left)`
									)}
								</Button>
							</div>
						) : null}
					</div>
				)}
			</section>
		</main>
	);
}
