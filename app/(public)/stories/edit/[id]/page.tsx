"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { useStoryStore } from "@/backend/v2/stores/useStoryStore";
import { Guard } from "@/components/auth/auth-initializer";
import { toast } from "sonner";
import { StoryEditor, StoryFormData } from "@/components/stories/story-editor";

export default function EditStoryPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = React.use(params);
	const router = useRouter();

	const {
		currentStory,
		isLoading: storeLoading,
		error: storeError,
		fetchStoryDetail,
		editStory,
		getStoryPermission,
	} = useStoryStore();

	const [isInitialized, setIsInitialized] = useState(false);
	const [initialData, setInitialData] = useState<any>(null);

	// Fetch story data on mount
	useEffect(() => {
		if (id) {
			fetchStoryDetail(id);
		}
	}, [id, fetchStoryDetail]);

	// Populate form fields
	useEffect(() => {
		if (currentStory && currentStory.id === id && !isInitialized) {
			const { canEdit } = getStoryPermission(id);
			if (!canEdit) {
				toast.error("You do not have permission to edit this story.");
				router.push(`/stories/${id}`);
				return;
			}

			setInitialData({
				title: currentStory.title,
				content: currentStory.description || "",
				tags: currentStory.tags?.join(", ") || "",
				categories: currentStory.categories
					? currentStory.categories
							.split(",")
							.map((c: string) => c.trim())
							.filter((c: string) => c)
					: [],
				featureImage: currentStory.feature_image,
				imagePreview: currentStory.feature_image,
			});
			setIsInitialized(true);
		}
	}, [currentStory, id, isInitialized, getStoryPermission, router]);

	const handleSubmit = async (data: StoryFormData) => {
		const { title, content, categoriesString, tags, featureImage } = data;

		const updates = {
			title,
			description: content,
			categories: categoriesString,
			tags,
		};

		const success = await editStory(id, updates, featureImage || undefined);

		if (success) {
			toast.success("Story updated successfully!");
			router.push(`/stories/${id}`);
			return true;
		} else {
			toast.error(
				useStoryStore.getState().error || "Failed to update story.",
			);
			return false;
		}
	};

	// Initial Loading State
	if (storeLoading && !isInitialized) {
		return (
			<Guard fallbackMessage="story editor">
				<div className="min-h-screen bg-card/5 py-12 px-6 flex items-center justify-center">
					<div className="text-center space-y-4">
						<Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
						<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
							Restoring narrative context...
						</p>
					</div>
				</div>
			</Guard>
		);
	}

	return (
		<Guard fallbackMessage="story editor">
			{isInitialized && initialData && (
				<StoryEditor
					initialData={initialData}
					pageTitle={
						<>
							Edit{" "}
							<span className="text-muted-foreground opacity-30 italic font-medium lowercase">
								story
							</span>
						</>
					}
					pageDescription="Refine your narrative. Updates will be visible to the Unseen Nepal community."
					cancelLink={{
						href: `/stories/${id}`,
						label: "Cancel & Return",
					}}
					submitLabel="Save Changes"
					SubmitIcon={Save}
					onSubmit={handleSubmit}
					storeLoading={storeLoading}
					storeError={storeError}
				/>
			)}
		</Guard>
	);
}
