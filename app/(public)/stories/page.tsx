"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, SearchX, Loader2, ArrowRight } from "lucide-react";
import { useStoryStore } from "@/backend/v2/stores/useStoryStore";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { StorySearch } from "@/components/stories/story-search";
import { StorySortFilter } from "@/components/stories/story-sort-filter";
import { StoryListCard } from "@/components/stories/story-list-card";
import { useDebounce } from "use-debounce";

export default function StoriesPage() {
	const { stories, total, isLoading, fetchStoriesPage } = useStoryStore();

	// State management
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch] = useDebounce(searchQuery, 400);
	const [category, setCategory] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState("latest");
	const [offset, setOffset] = useState(0);
	const limit = 12;

	// Fetch stories on filter/search change
	useEffect(() => {
		fetchStoriesPage({
			limit,
			offset,
			category,
			sortBy,
			searchQuery: debouncedSearch,
		});
	}, [fetchStoriesPage, offset, category, sortBy, debouncedSearch]);

	const handleCategoryChange = (cat: string | null) => {
		setCategory(cat);
		setOffset(0);
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setCategory(null);
		setSortBy("latest");
		setOffset(0);
	};

	const hasResults = stories.length > 0;
	const totalPages = Math.ceil(total / limit);
	const currentPage = Math.floor(offset / limit) + 1;

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
				<div className="space-y-8">
					{/* Header */}
					<div className="space-y-4">
						<div className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
							Community Journals
						</div>
						<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
							Travel Stories
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl">
							Explore real experiences shared by the Unseen Nepal
							community. Discover authentic travel insights and
							inspiration from fellow explorers.
						</p>
					</div>

					{/* Search Section */}
					<div className="bg-muted/30 rounded-lg p-6 space-y-4">
						<StorySearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search stories, locations, or authors..."
						/>

						{/* Filters and Sort */}
						<StorySortFilter
							sortBy={sortBy}
							onSortChange={setSortBy}
							category={category}
							onCategoryChange={handleCategoryChange}
							onClearFilters={handleClearFilters}
						/>

						{/* Share Story CTA */}
						<div className="pt-4 border-t border-border">
							<Button asChild className="gap-2">
								<Link href="/stories/add">
									<Upload className="h-4 w-4" />
									Share your story
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</main>

			{/* Results Section */}
			<div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
				{/* Results Counter */}
				{hasResults && (
					<div className="mb-8 flex items-center justify-between pb-6 border-b">
						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground">
								{total} {total === 1 ? "story" : "stories"}{" "}
								found
							</p>
							<p className="text-xs text-muted-foreground/70">
								Page {currentPage} of {totalPages}
							</p>
						</div>
					</div>
				)}

				{/* Loading State */}
				{isLoading && stories.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
						<p className="text-sm text-muted-foreground">
							Loading stories...
						</p>
					</div>
				) : hasResults ? (
					<>
						{/* Stories Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
							{stories.map((story) => (
								<StoryListCard key={story.id} story={story} />
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-center gap-4">
								<Button
									variant="outline"
									disabled={offset === 0}
									onClick={() =>
										setOffset(Math.max(0, offset - limit))
									}>
									Previous
								</Button>

								<span className="text-sm text-muted-foreground">
									Page {currentPage} of {totalPages}
								</span>

								<Button
									variant="outline"
									disabled={offset + limit >= total}
									onClick={() => setOffset(offset + limit)}>
									Next
								</Button>
							</div>
						)}
					</>
				) : (
					/* Empty State */
					<div className="rounded-lg border-2 border-dashed bg-muted/20 p-12 text-center">
						<SearchX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">
							No stories found
						</h3>
						<p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
							Try adjusting your search filters or be the first to
							share a story from your travels.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button
								variant="outline"
								onClick={handleClearFilters}>
								Clear filters
							</Button>
							<Button asChild className="gap-2">
								<Link href="/stories/add">
									<Upload className="h-4 w-4" />
									Share your story
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
