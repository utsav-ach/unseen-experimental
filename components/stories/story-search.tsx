"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function StorySearch({
	value,
	onChange,
	placeholder = "Search stories, locations, or authors...",
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}) {
	return (
		<div className="relative w-full">
			<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
			<Input
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-12 pl-12 pr-6 rounded-lg bg-background border-border text-sm focus-visible:ring-primary/20 transition-all"
			/>
		</div>
	);
}
