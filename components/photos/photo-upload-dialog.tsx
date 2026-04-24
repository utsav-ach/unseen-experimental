"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { usePhotoStore } from "@/backend/v2/stores/usePhotoStore";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Loader2,
	MapPin,
	Plus,
	Upload,
	Image as ImageIcon,
	FileText,
} from "lucide-react";
import { SelectionMap, SelectionPin } from "@/components/map/selection-map";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoUploadDialogProps {
	children?: React.ReactNode;
}

export function PhotoUploadDialog({ children }: PhotoUploadDialogProps) {
	const router = useRouter();
	const profile = useAuthStore((state) => state.profile());
	const setRedirectPage = useAuthStore((state) => state.setRedirectPage);
	const createPhoto = usePhotoStore((state) => state.createPhoto);
	const isLoading = usePhotoStore((state) => state.isLoading);
	const error = usePhotoStore((state) => state.error);

	const [isOpen, setIsOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [description, setDescription] = useState("");
	const [locationName, setLocationName] = useState("");
	const [selectedPins, setSelectedPins] = useState<SelectionPin[]>([]);
	const [showDescription, setShowDescription] = useState(false);
	const [showLocation, setShowLocation] = useState(false);
	const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const selectedPin = selectedPins[selectedPins.length - 1];

	const previewItems = useMemo(
		() =>
			selectedFiles.map((file) => ({
				file,
				previewUrl: URL.createObjectURL(file),
			})),
		[selectedFiles],
	);

	useEffect(() => {
		return () => {
			previewItems.forEach((item) =>
				URL.revokeObjectURL(item.previewUrl),
			);
		};
	}, [previewItems]);

	const selectedLocationPayload = useMemo(() => {
		if (!selectedPin) return null;
		return {
			type: "Point" as const,
			coordinates: [selectedPin.lng, selectedPin.lat] as [number, number],
		};
	}, [selectedPin]);

	const handleOpenChange = (open: boolean) => {
		if (open && !profile?.id) {
			setRedirectPage("/photos");
			toast.error("Please log in to share a photo.");
			router.push("/login");
			return;
		}
		setIsOpen(open);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		setSelectedFiles((currentFiles) => [...currentFiles, ...files]);
		setSelectedPreviewIndex(0);
	};

	const triggerFilePicker = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (selectedFiles.length === 0) {
			toast.error("Please select at least one photo to upload.");
			return;
		}

		const success = await createPhoto(
			{
				description: description.trim() || null,
				location: selectedLocationPayload,
				location_name:
					locationName.trim() || selectedPin?.address || null,
			},
			selectedFiles,
		);

		if (success) {
			toast.success("Photo shared successfully.");
			setIsOpen(false);
			setSelectedFiles([]);
			setDescription("");
			setLocationName("");
			setSelectedPins([]);
			setSelectedPreviewIndex(0);
			setShowDescription(false);
			setShowLocation(false);
		} else {
			toast.error(error || "Failed to upload photo.");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{children || (
					<Button className="inline-flex items-center gap-2">
						<Upload className="h-4 w-4" />
						Share photo
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-[92vh] overflow-y-auto rounded-xl border bg-background p-4 sm:p-6 lg:max-w-4xl">
				<DialogHeader className="space-y-2 text-left">
					<DialogTitle className="text-xl font-semibold tracking-tight">
						Share a photo
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Upload photos first, then optionally add a description
						or pin a location.
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-5" onSubmit={handleSubmit}>
					{error && (
						<Alert variant="destructive">
							<AlertTitle>Could not upload photo</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<input
						ref={fileInputRef}
						className="hidden"
						type="file"
						accept="image/*"
						multiple
						onChange={handleFileChange}
					/>

					<section className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm font-medium text-foreground">
								<ImageIcon className="h-4 w-4 text-primary" />
								Photos
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={triggerFilePicker}
								className="gap-2">
								<Plus className="h-4 w-4" />
								Add photos
							</Button>
						</div>

						<div className="grid gap-3 lg:grid-cols-[1fr_auto]">
							<div className="relative min-h-[320px] overflow-hidden rounded-xl border bg-muted/20">
								{previewItems[selectedPreviewIndex] ? (
									<Image
										src={
											previewItems[selectedPreviewIndex]
												.previewUrl
										}
										alt={
											previewItems[selectedPreviewIndex]
												.file.name
										}
										fill
										className="object-cover"
									/>
								) : (
									<button
										type="button"
										onClick={triggerFilePicker}
										className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
										<div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background">
											<Plus className="h-6 w-6" />
										</div>
										<div className="space-y-1">
											<p className="text-sm font-medium text-foreground">
												Add photos
											</p>
											<p className="text-xs text-muted-foreground">
												Choose one or more images to
												build the post preview.
											</p>
										</div>
									</button>
								)}
							</div>

							<div className="flex flex-row gap-3 overflow-x-auto lg:w-[180px] lg:flex-col lg:overflow-visible">
								{previewItems.map((item, index) => (
									<button
										key={`${item.file.name}-${index}`}
										type="button"
										onClick={() =>
											setSelectedPreviewIndex(index)
										}
										className={cn(
											"group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted lg:h-24 lg:w-full",
											selectedPreviewIndex === index &&
												"ring-2 ring-primary",
										)}
										aria-label={`Preview ${item.file.name}`}>
										<Image
											src={item.previewUrl}
											alt={item.file.name}
											fill
											className="object-cover"
										/>
										<span className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/15" />
									</button>
								))}

								<button
									type="button"
									onClick={triggerFilePicker}
									className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed bg-card text-muted-foreground lg:h-24 lg:w-full">
									<Plus className="h-5 w-5" />
								</button>
							</div>
						</div>
					</section>

					<section className="rounded-xl border bg-card p-3 sm:p-4">
						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								variant={
									showDescription ? "default" : "outline"
								}
								size="sm"
								onClick={() =>
									setShowDescription((value) => !value)
								}
								className="gap-2">
								<FileText className="h-4 w-4" />
								Description
							</Button>
							<Button
								type="button"
								variant={showLocation ? "default" : "outline"}
								size="sm"
								onClick={() =>
									setShowLocation((value) => !value)
								}
								className="gap-2">
								<MapPin className="h-4 w-4" />
								Choose location
							</Button>
						</div>

						<div
							className={cn(
								"mt-4 space-y-4",
								!showDescription && !showLocation && "hidden",
							)}>
							{showDescription && (
								<div className="space-y-2">
									<Label htmlFor="photo-description">
										Description
									</Label>
									<textarea
										id="photo-description"
										value={description}
										onChange={(
											event: React.ChangeEvent<HTMLTextAreaElement>,
										) => setDescription(event.target.value)}
										placeholder="Optional caption or short story"
										className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</div>
							)}

							{showLocation && (
								<div className="space-y-3">
									<div className="space-y-2">
										<Label htmlFor="photo-location">
											Location name
										</Label>
										<Input
											id="photo-location"
											value={locationName}
											onChange={(event) =>
												setLocationName(
													event.target.value,
												)
											}
											placeholder="Optional place name"
										/>
									</div>

									<div className="overflow-hidden rounded-xl border">
										<SelectionMap
											initialPins={selectedPins}
											onPinsChange={setSelectedPins}
											className="h-[360px]"
										/>
									</div>
									<p className="text-xs text-muted-foreground">
										Click once on the map to store a
										geospatial location for this post.
									</p>
								</div>
							)}
						</div>
					</section>

					<DialogFooter className="gap-3 pt-2 sm:flex-row">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="inline-flex items-center gap-2">
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Upload className="h-4 w-4" />
							)}
							Share photo
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
