"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
	onSearch?: (value: string) => void;
	onClear?: () => void;
	isLoading?: boolean;
	className?: string;
	containerClassName?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
	(
		{
			onSearch,
			onClear,
			isLoading,
			className,
			containerClassName,
			value,
			onChange,
			...props
		},
		ref,
	) => {
		const [inputValue, setInputValue] = React.useState(value || "");

		React.useEffect(() => {
			setInputValue(value || "");
		}, [value]);

		const handleClear = () => {
			setInputValue("");
			if (onClear) onClear();
			if (onSearch) onSearch("");
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setInputValue(e.target.value);
			if (onChange) onChange(e);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" && onSearch) {
				onSearch(inputValue as string);
			}
		};

		return (
			<div className={cn("relative group w-full", containerClassName)}>
				<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Search className="h-4 w-4" />
					)}
				</div>
				<Input
					ref={ref}
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					className={cn(
						"pl-10 pr-10 py-2 h-11 w-full bg-background border-muted hover:border-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 rounded-xl",
						className,
					)}
					{...props}
				/>
				{inputValue && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={handleClear}
						className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent transition-all duration-200">
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		);
	},
);

SearchBar.displayName = "SearchBar";
