"use client";

import * as React from "react";
import { User, Loader2, Camera, Upload, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
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

interface AvatarPickerProps {
	label?: string; // e.g., "Profile Photo"
	infoText?: string;
	isRequired?: boolean;
	value?: string; // The existing avatar URL
	onImageUploaded: (url: string) => void;
	onUploadError?: (error: string) => void;
	uploadFileApi: (file: File) => Promise<string | null>; // Inject the API call
	className?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
	label = "Profile Photo",
	infoText,
	isRequired,
	value,
	onImageUploaded,
	onUploadError,
	uploadFileApi,
	className,
}) => {
	const [isUploading, setIsUploading] = React.useState(false);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		if (onUploadError) onUploadError(""); // Clear old errors

		try {
			// Call the API function passed down as a prop
			const uploadedUrl = await uploadFileApi(file);
			if (uploadedUrl) {
				onImageUploaded(uploadedUrl); // Inform parent of success
			}
		} catch (err: any) {
			if (onUploadError) {
				onUploadError(err.message || "Failed to upload image");
			}
		} finally {
			setIsUploading(false);
			// Clear input so user can re-upload the same file if needed
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<FieldGroup
			className={cn("w-full flex flex-col items-center", className)}>
			<div className="w-full flex justify-between items-center mb-4 px-1">
				<div className="flex items-center gap-2">
					<FieldLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1">
						{label}
						{isRequired && (
							<span className="text-destructive">*</span>
						)}
					</FieldLabel>

					{/* Reusable Popover Info Icon logic from InputField */}
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
										Click for info
									</TooltipContent>
								</Tooltip>
								<PopoverContent
									side="top"
									align="center"
									className="max-w-[220px] p-3 text-xs font-medium rounded-xl">
									{infoText}
								</PopoverContent>
							</Popover>
						</TooltipProvider>
					)}
				</div>
			</div>

			<div className="flex flex-col items-center gap-6 py-4">
				{/* The Clickable Avatar Circle */}
				<div
					className="relative group cursor-pointer"
					onClick={triggerFileInput}
					aria-label="Upload profile photo">
					<Avatar className="h-32 w-32 border-4 border-background shadow-xl group-hover:opacity-80 transition-all">
						<AvatarImage src={value} alt="Profile preview" />
						<AvatarFallback className="bg-muted text-muted-foreground">
							<User className="h-12 w-12" />
						</AvatarFallback>
					</Avatar>

					{/* Camera Hover Overlay */}
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/40 text-white z-10">
						<Camera className="h-6 w-6" />
					</div>

					{/* Loading Spinner Overlays entire circle */}
					{isUploading && (
						<div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-full flex items-center justify-center z-20">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					)}
				</div>

				{/* Hidden File Input */}
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept="image/*"
					onChange={handleFileChange}
					disabled={isUploading}
				/>

				{/* Standard Upload Button */}
				<Button
					variant="outline"
					size="sm"
					type="button"
					onClick={triggerFileInput}
					disabled={isUploading}
					className="rounded-full font-bold h-9 px-5 gap-2">
					{isUploading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Upload className="h-4 w-4" />
					)}
					{isUploading ? "Uploading..." : "Upload Photo"}
				</Button>
			</div>
		</FieldGroup>
	);
};
