"use client";

import { useMemo, useState } from "react";
import { FeaturedDestination } from "@/backend/schemas";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminDestinationFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: FeaturedDestination | null;
	isSubmitting?: boolean;
	onSubmit: (
		payload: Omit<FeaturedDestination, "id" | "created_at">,
	) => Promise<boolean>;
}

interface DestinationFormValues {
	name: string;
	coordinates: string;
	radius: string;
	avg_rating: string;
	tags: string;
	description: string;
	feature_image: string;
	additional_images: string;
	possible_activities: string;
}

const initialFormValues: DestinationFormValues = {
	name: "",
	coordinates: "",
	radius: "25",
	avg_rating: "",
	tags: "",
	description: "",
	feature_image: "",
	additional_images: "",
	possible_activities: "",
};

const splitCsv = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);

const toCoordinatesInput = (value: FeaturedDestination["coordinates"]) => {
	if (typeof value === "string") return value;
	return `${value.coordinates[0]}, ${value.coordinates[1]}`;
};

const toCoordinatesPayload = (
	value: string,
): FeaturedDestination["coordinates"] => {
	const trimmed = value.trim();
	const coordinates = trimmed.match(
		/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
	);
	if (!coordinates) return trimmed;

	return {
		type: "Point",
		coordinates: [Number(coordinates[1]), Number(coordinates[2])],
	};
};

export function AdminDestinationFormDialog({
	open,
	onOpenChange,
	initialData,
	isSubmitting = false,
	onSubmit,
}: AdminDestinationFormDialogProps) {
	const defaultValues = useMemo<DestinationFormValues>(() => {
		if (!initialData) return initialFormValues;

		return {
			name: initialData.name,
			coordinates: toCoordinatesInput(initialData.coordinates),
			radius: String(initialData.radius),
			avg_rating: initialData.avg_rating?.toString() ?? "",
			tags: (initialData.tags ?? []).join(", "),
			description: initialData.description ?? "",
			feature_image: initialData.feature_image ?? "",
			additional_images: (initialData.additional_images ?? []).join(", "),
			possible_activities: (initialData.possible_activities ?? []).join(
				", ",
			),
		};
	}, [initialData]);

	const [values, setValues] = useState<DestinationFormValues>(defaultValues);
	const [error, setError] = useState<string | null>(null);

	const heading = useMemo(
		() => (initialData ? "Edit destination" : "Add destination"),
		[initialData],
	);

	const handleSubmit = async () => {
		const name = values.name.trim();
		const coordinates = values.coordinates.trim();
		const radiusNumber = Number(values.radius);
		const ratingNumber = values.avg_rating.trim()
			? Number(values.avg_rating)
			: undefined;
		const tags = splitCsv(values.tags);
		const additionalImages = splitCsv(values.additional_images);
		const featureImage = values.feature_image.trim();
		const activities = splitCsv(values.possible_activities);

		if (!name) {
			setError("Destination name is required.");
			return;
		}

		if (!coordinates) {
			setError("Coordinates are required.");
			return;
		}

		if (!Number.isFinite(radiusNumber) || radiusNumber <= 0) {
			setError("Radius must be a valid positive number.");
			return;
		}

		if (
			ratingNumber !== undefined &&
			(!Number.isFinite(ratingNumber) ||
				ratingNumber < 0 ||
				ratingNumber > 5)
		) {
			setError("Rating must be between 0 and 5.");
			return;
		}

		if (!featureImage) {
			setError("Feature image URL is required.");
			return;
		}

		const imageCandidates = [featureImage, ...additionalImages];

		const invalidImage = imageCandidates.find((url) => {
			try {
				new URL(url);
				return false;
			} catch {
				return true;
			}
		});

		if (invalidImage) {
			setError("All image values must be valid URLs.");
			return;
		}

		if (!additionalImages.length) {
			setError("At least one additional image URL is required.");
			return;
		}

		setError(null);

		const ok = await onSubmit({
			name,
			coordinates: toCoordinatesPayload(coordinates),
			radius: radiusNumber,
			avg_rating: ratingNumber,
			tags,
			description: values.description.trim() || null,
			feature_image: featureImage,
			additional_images: additionalImages,
			possible_activities: activities,
		});

		if (ok) {
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{heading}</DialogTitle>
					<DialogDescription>
						Keep destination data accurate. This module drives
						public discovery, map selection, and booking flow.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Destination name
						</p>
						<Input
							value={values.name}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									name: event.target.value,
								}))
							}
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-xs text-muted-foreground">
							Coordinates
						</p>
						<Input
							value={values.coordinates}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									coordinates: event.target.value,
								}))
							}
							placeholder="85.3240, 27.7172"
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-xs text-muted-foreground">
							Radius (km)
						</p>
						<Input
							type="number"
							min="1"
							value={values.radius}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									radius: event.target.value,
								}))
							}
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-xs text-muted-foreground">
							Rating (optional, 0-5)
						</p>
						<Input
							type="number"
							min="0"
							max="5"
							step="0.1"
							value={values.avg_rating}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									avg_rating: event.target.value,
								}))
							}
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-xs text-muted-foreground">
							Tags (comma separated)
						</p>
						<Input
							value={values.tags}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									tags: event.target.value,
								}))
							}
							placeholder="himalaya, lake, family"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Feature image URL
						</p>
						<Input
							value={values.feature_image}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									feature_image: event.target.value,
								}))
							}
							placeholder="https://..."
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Additional image URLs (comma separated)
						</p>
						<Input
							value={values.additional_images}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									additional_images: event.target.value,
								}))
							}
							placeholder="https://... , https://..."
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Activity IDs (comma separated UUID)
						</p>
						<Input
							value={values.possible_activities}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									possible_activities: event.target.value,
								}))
							}
							placeholder="UUID, UUID"
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Description
						</p>
						<Input
							value={values.description}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									description: event.target.value,
								}))
							}
							placeholder="Short destination summary"
						/>
					</div>
				</div>

				{error ? (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						onClick={() => void handleSubmit()}
						disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save destination"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
