"use client";

import React from "react";
import { Search, SlidersHorizontal, Map as MapIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImmersiveSearchProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	placeholder?: string;

	// Sort logic
	sortBy?: string;
	onSortChange?: (value: string) => void;
	sortOptions?: { label: string; value: string }[];

	// Map logic
	showMap?: boolean;
	onMapToggle?: () => void;
	mapLabel?: string;
}

export function ImmersiveSearch({
	searchQuery,
	onSearchChange,
	placeholder = "Search by name, location, or expertise...",
	sortBy,
	onSortChange,
	sortOptions = [
		{ label: "Highest Rated", value: "rating" },
		{ label: "Most Recent", value: "recent" },
	],
	showMap,
	onMapToggle,
	mapLabel = "Map Discovery",
}: ImmersiveSearchProps) {
	return (
		<div className="flex flex-col lg:flex-row items-center gap-4 w-full">
			<div className="relative flex-1 w-full">
				<Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-30" />
				<Input
					placeholder={placeholder}
					className="h-14 pl-12 pr-6 rounded-2xl bg-background/50 border-border text-base font-medium focus-visible:ring-primary/20 transition-all"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>

			<div className="flex items-center gap-3 w-full lg:w-auto">
				{onSortChange && (
					<Select value={sortBy} onValueChange={onSortChange}>
						<SelectTrigger className="h-14 px-6 rounded-2xl min-w-[180px] bg-background/50 font-bold text-[10px] uppercase tracking-widest border-border group">
							<div className="flex items-center gap-2">
								<SlidersHorizontal className="h-4 w-4 text-primary transition-transform group-hover:rotate-90" />
								<SelectValue placeholder="Sort By" />
							</div>
						</SelectTrigger>
						<SelectContent className="rounded-xl border-primary/5 p-1 shadow-xl">
							{sortOptions.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}
									className="rounded-lg py-2 font-bold uppercase tracking-widest text-[9px]">
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{onMapToggle && (
					<Button
						onClick={onMapToggle}
						className={cn(
							"h-14 px-8 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all gap-2 shadow-lg shadow-primary/5",
							showMap
								? "bg-primary text-white"
								: "bg-muted/50 hover:bg-primary/10 text-foreground border-border",
						)}
						variant={showMap ? "default" : "outline"}>
						{showMap ? (
							<X className="h-4 w-4" />
						) : (
							<MapIcon className="h-4 w-4" />
						)}
						{showMap ? "Close Map" : mapLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
