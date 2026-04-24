"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useStoryStore } from "@/backend/v2/stores/useStoryStore";
import { Guard } from "@/components/auth/auth-initializer";
import { StoryEditor, StoryFormData } from "@/components/stories/story-editor";
import { toast } from "sonner";

export default function AddStoryPage() {
	const router = useRouter();
	const {
		createStory,
		error: storeError,
		isLoading: storeLoading,
	} = useStoryStore();

	const handleSubmit = async (data: StoryFormData) => {
		const { title, content, categoriesString, tags, featureImage } = data;

		const success = await createStory(
			title,
			content,
			categoriesString,
			tags,
			featureImage!,
		);

		if (success) {
			toast.success("Story published successfully!");
			router.push("/stories");
			return true;
		} else {
			toast.error(
				useStoryStore.getState().error || "Failed to publish story.",
			);
			return false;
		}
	};

	return (
		<Guard fallbackMessage="story editor">
			<StoryEditor
				pageTitle={
					<>
						Write a{" "}
						<span className="text-muted-foreground opacity-30 italic font-medium lowercase">
							story
						</span>
					</>
				}
				pageDescription="Capture your adventure and share your experience with the world through words and imagery."
				cancelLink={{ href: "/stories", label: "Go back to feed" }}
				submitLabel="Publish Your Journal"
				SubmitIcon={Upload}
				onSubmit={handleSubmit}
				storeLoading={storeLoading}
				storeError={storeError}
			/>
		</Guard>
	);
}
