"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, Info, LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	infoText?: string;
	icon?: LucideIcon;
	error?: string | null;
	isRequired?: boolean;
	obscureText?: boolean;
	isLoading?: boolean;
	loadingText?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
	(
		{
			label,
			infoText,
			icon: Icon,
			error,
			isRequired,
			obscureText,
			type = "text",
			isLoading = false,
			loadingText,
			className,
			disabled,
			...props
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const inputType = obscureText
			? showPassword
				? "text"
				: "password"
			: type;

		return (
			<Field className="w-full">
				<div className="flex justify-between items-center mb-2 px-1">
					<div className="flex items-center gap-2">
						<FieldLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1">
							{label}
							{isRequired && (
								<span className="text-destructive">*</span>
							)}
						</FieldLabel>

						{/* Info Icon with Hover Delay + Click Support */}
						{infoText && (
							<TooltipProvider delayDuration={1000}>
								{" "}
								{/* 1 second hover wait */}
								<Popover>
									<Tooltip>
										<TooltipTrigger asChild>
											<PopoverTrigger asChild>
												<button
													type="button"
													className="text-muted-foreground/50 hover:text-primary transition-colors outline-none">
													<Info className="h-3.5 w-3.5" />
												</button>
											</PopoverTrigger>
										</TooltipTrigger>
										<TooltipContent
											side="top"
											className="text-[10px] font-bold">
											Click for more info
										</TooltipContent>
									</Tooltip>
									<PopoverContent
										side="top"
										align="start"
										className="max-w-[240px] p-3 text-xs font-medium bg-popover border-primary/20 shadow-xl rounded-xl">
										<p className="leading-relaxed">
											{infoText}
										</p>
									</PopoverContent>
								</Popover>
							</TooltipProvider>
						)}
					</div>

					{isLoading && loadingText && (
						<span className="text-[10px] font-bold text-primary animate-pulse italic">
							{loadingText}...
						</span>
					)}
				</div>

				<div className="relative group">
					{Icon && (
						<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
							<Icon
								className={cn(
									"h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
									isLoading && "opacity-20",
								)}
							/>
						</div>
					)}

					<Input
						{...props}
						ref={ref}
						type={inputType}
						disabled={disabled || isLoading}
						className={cn(
							"font-bold transition-all h-12 rounded-2xl",
							Icon && "pl-12",
							(obscureText || isLoading) && "pr-12",
							error &&
								"border-destructive/50 ring-destructive/10",
							isLoading && "bg-muted/30 cursor-wait",
							className,
						)}
					/>

					<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center z-10">
						{isLoading ? (
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
						) : obscureText ? (
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="text-muted-foreground hover:text-foreground transition-colors p-1">
								{showPassword ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						) : null}
					</div>
				</div>

				{error && (
					<p className="mt-1.5 text-[11px] font-bold text-destructive px-1">
						{error}
					</p>
				)}
			</Field>
		);
	},
);

InputField.displayName = "InputField";
