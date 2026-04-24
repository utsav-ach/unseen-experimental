"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { countries, Country } from "@/lib/data/countries";

interface CountrySelectProps {
	value?: string; // Dial code or ISO code
	onSelect: (country: Country) => void;
	className?: string;
	placeholder?: string;
	showDialCode?: boolean;
}

export function CountrySelect({
	value,
	onSelect,
	className,
	placeholder = "Select country...",
	showDialCode = true,
}: CountrySelectProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	const selectedCountry = React.useMemo(() => {
		return countries.find(
			(c) => (showDialCode ? c.dial_code : c.code) === value,
		);
	}, [value, showDialCode]);

	const filteredCountries = React.useMemo(() => {
		if (!searchQuery) return countries;
		const lowerQuery = searchQuery.toLowerCase();
		return countries.filter(
			(c) =>
				c.name.toLowerCase().includes(lowerQuery) ||
				c.dial_code.includes(lowerQuery) ||
				c.code.toLowerCase().includes(lowerQuery),
		);
	}, [searchQuery]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-full h-12 rounded-2xl font-bold px-2 flex items-center justify-between gap-1",
						className,
					)}>
					<div className="flex items-center gap-2 overflow-hidden h-full">
						{selectedCountry ? (
							<>
								<span className="text-xl shrink-0">
									{selectedCountry.flag}
								</span>
								<span className="truncate whitespace-nowrap">
									{showDialCode
										? `${selectedCountry.dial_code}`
										: selectedCountry.name}
								</span>
							</>
						) : (
							<span className="text-muted-foreground">
								{placeholder}
							</span>
						)}
					</div>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 glass-card border-primary/20 shadow-2xl rounded-2xl overflow-hidden">
				<div className="flex items-center border-b border-primary/10 px-3 h-12">
					<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					<input
						className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground font-medium"
						placeholder="Search country..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
					{filteredCountries.length === 0 ? (
						<div className="py-6 text-center text-sm text-muted-foreground font-medium">
							No country found.
						</div>
					) : (
						filteredCountries.map((country) => (
							<button
								key={`${country.code}-${country.dial_code}`}
								className={cn(
									"relative flex w-full cursor-default select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors hover:bg-primary/10 font-semibold",
									(showDialCode
										? country.dial_code
										: country.code) === value &&
										"bg-primary/5 text-primary",
								)}
								onClick={() => {
									onSelect(country);
									setOpen(false);
									setSearchQuery("");
								}}>
								<span className="mr-3 text-xl">
									{country.flag}
								</span>
								<span className="flex-1 text-left truncate">
									{country.name}
								</span>
								{showDialCode && (
									<span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground font-black">
										{country.dial_code}
									</span>
								)}
								<Check
									className={cn(
										"ml-auto h-4 w-4",
										(showDialCode
											? country.dial_code
											: country.code) === value
											? "opacity-100"
											: "opacity-0",
									)}
								/>
							</button>
						))
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
