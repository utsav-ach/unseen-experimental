"use client";

import * as React from "react";
import { Info, PenTool, Type } from "lucide-react";
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
import { GFMEditor } from "@/components/ui/gfm-editor";

interface GFMInputFieldProps extends Omit<
	React.TextareaHTMLAttributes<HTMLTextAreaElement>,
	"value" | "onChange"
> {
	value: string;
	onChange: (value: string) => void;
	label: string;
	infoText?: string;
	error?: string | null;
	isRequired?: boolean;
	disabled?: boolean;

	// GFM Editor Options
	acceptImage?: boolean;
	onImageUpload?: (file: File) => Promise<string>;
	onSave?: (savedValue: string) => Promise<void>;
}

export const GFMInputField = React.forwardRef<
	HTMLTextAreaElement,
	GFMInputFieldProps
>(
	(
		{
			value,
			onChange,
			label,
			infoText,
			error,
			isRequired,
			disabled,
			className,
			acceptImage,
			onImageUpload,
			onSave,
			...props
		},
		ref,
	) => {
		const [isEditorMode, setIsEditorMode] = React.useState(false);

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

						{/* Info Icon Tooltip/Popover */}
						{infoText && (
							<TooltipProvider delayDuration={1000}>
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

					{/* Editor Toggle */}
					<button
						type="button"
						onClick={() => setIsEditorMode(!isEditorMode)}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
							isEditorMode
								? "bg-primary/10 text-primary hover:bg-primary/20"
								: "bg-muted text-muted-foreground hover:bg-muted/80",
						)}>
						{isEditorMode ? (
							<>
								<Type className="h-3 w-3" />
								Standard Text Mode
							</>
						) : (
							<>
								<PenTool className="h-3 w-3" />
								Rich Editor Mode
							</>
						)}
					</button>
				</div>

				<div className="relative group transition-all duration-300">
					{isEditorMode ? (
						<GFMEditor
							value={value}
							onChange={(val) => onChange(val || "")}
							acceptImage={acceptImage}
							onImageUpload={onImageUpload}
							onSave={onSave}
							className={cn(
								error &&
									"border-destructive/50 ring-1 ring-destructive/10",
							)}
						/>
					) : (
						<textarea
							ref={ref}
							value={value}
							onChange={(e) => onChange(e.target.value)}
							disabled={disabled}
							className={cn(
								"flex w-full min-h-[140px] rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
								"font-medium resize-y",
								error &&
									"border-destructive/50 ring-destructive/10 focus-visible:ring-destructive/20",
								className,
							)}
							placeholder="Type your content here... Toggle Rich Editor Mode for markdown features."
							{...props}
						/>
					)}
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

GFMInputField.displayName = "GFMInputField";
