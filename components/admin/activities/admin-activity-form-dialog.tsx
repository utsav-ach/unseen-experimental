"use client";

import { useMemo, useState } from "react";
import { Activity } from "@/backend/schemas";
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

interface AdminActivityFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: Activity | null;
	isSubmitting?: boolean;
	onSubmit: (
		payload: Omit<Activity, "id" | "created_at">,
	) => Promise<boolean>;
}

interface ActivityFormValues {
	name: string;
	featured_image: string;
	display_category: string;
	duration_range: string;
	difficulty: string;
	description: string;
}

const initialFormValues: ActivityFormValues = {
	name: "",
	featured_image: "",
	display_category: "Adventure",
	duration_range: "1-3 Days",
	difficulty: "Moderate",
	description: "",
};

export function AdminActivityFormDialog({
	open,
	onOpenChange,
	initialData,
	isSubmitting = false,
	onSubmit,
}: AdminActivityFormDialogProps) {
	const defaultValues = useMemo<ActivityFormValues>(() => {
		if (!initialData) return initialFormValues;

		return {
			name: initialData.name,
			featured_image: initialData.featured_image ?? "",
			display_category: initialData.display_category,
			duration_range: initialData.duration_range,
			difficulty: initialData.difficulty,
			description: initialData.description ?? "",
		};
	}, [initialData]);

	const [values, setValues] = useState<ActivityFormValues>(defaultValues);
	const [error, setError] = useState<string | null>(null);

	const heading = useMemo(
		() => (initialData ? "Edit activity" : "Add activity"),
		[initialData],
	);

	const handleSubmit = async () => {
		const name = values.name.trim();
		const featuredImage = values.featured_image.trim();

		if (!name) {
			setError("Activity name is required.");
			return;
		}

		if (featuredImage) {
			try {
				new URL(featuredImage);
			} catch {
				setError("Featured image must be a valid URL.");
				return;
			}
		}

		setError(null);

		const ok = await onSubmit({
			name,
			featured_image: featuredImage || null,
			description: values.description.trim() || null,
			display_category: values.display_category.trim() || "Adventure",
			duration_range: values.duration_range.trim() || "1-3 Days",
			difficulty: values.difficulty.trim() || "Moderate",
		});

		if (ok) {
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{heading}</DialogTitle>
					<DialogDescription>
						Keep activity entries clean and descriptive. These
						values are shown publicly in discovery and package
						flows.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Activity name
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

					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Featured image URL (optional)
						</p>
						<Input
							value={values.featured_image}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									featured_image: event.target.value,
								}))
							}
							placeholder="https://..."
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-xs text-muted-foreground">
							Category
						</p>
						<Input
							value={values.display_category}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									display_category: event.target.value,
								}))
							}
						/>
					</div>

					<div className="space-y-1.5">
						<p className="text-xs text-muted-foreground">
							Difficulty
						</p>
						<Input
							value={values.difficulty}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									difficulty: event.target.value,
								}))
							}
						/>
					</div>

					<div className="space-y-1.5 sm:col-span-2">
						<p className="text-xs text-muted-foreground">
							Duration range
						</p>
						<Input
							value={values.duration_range}
							onChange={(event) =>
								setValues((state) => ({
									...state,
									duration_range: event.target.value,
								}))
							}
							placeholder="1-3 Days"
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
							placeholder="Short activity details"
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
						{isSubmitting ? "Saving..." : "Save activity"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
