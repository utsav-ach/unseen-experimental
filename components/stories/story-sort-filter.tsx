"use client";

import { SlidersHorizontal, X } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
	{ value: "latest", label: "Latest" },
	{ value: "popular", label: "Most Popular" },
	{ value: "most_commented", label: "Most Discussed" },
];

const CATEGORIES = [
	"Adventure",
	"Culture",
	"Trekking",
	"Wildlife",
	"Food",
	"Spiritual",
];

export function StorySortFilter({
	sortBy,
	onSortChange,
	category,
	onCategoryChange,
	onClearFilters,
}: {
	sortBy: string;
	onSortChange: (value: string) => void;
	category: string | null;
	onCategoryChange: (cat: string | null) => void;
	onClearFilters: () => void;
}) {
	const hasActiveFilters = sortBy !== "latest" || category !== null;

	return (
		<div className="space-y-4">
			{/* Sort and Actions Row */}
			<div className="flex items-center gap-3">
				<Select value={sortBy} onValueChange={onSortChange}>
					<SelectTrigger className="h-11 px-4 rounded-lg bg-muted/50 border-border text-sm font-medium min-w-fit">
						<div className="flex items-center gap-2">
							<SlidersHorizontal className="h-4 w-4 text-primary" />
							<SelectValue placeholder="Sort" />
						</div>
					</SelectTrigger>
					<SelectContent className="rounded-lg">
						{SORT_OPTIONS.map((opt) => (
							<SelectItem
								key={opt.value}
								value={opt.value}
								className="text-sm">
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearFilters}
						className="h-11 gap-2 text-muted-foreground hover:text-foreground">
						<X className="h-4 w-4" />
						Clear filters
					</Button>
				)}
			</div>

			{/* Categories */}
			<div className="flex flex-wrap gap-2">
				{CATEGORIES.map((cat) => (
					<button
						key={cat}
						onClick={() =>
							onCategoryChange(category === cat ? null : cat)
						}
						className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
							category === cat
								? "bg-primary text-primary-foreground"
								: "bg-muted hover:bg-muted/80 text-foreground"
						}`}>
						{cat}
					</button>
				))}
			</div>
		</div>
	);
}
