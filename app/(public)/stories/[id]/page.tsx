"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { useStoryStore } from "@/backend/v2/stores/useStoryStore";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StoryHeader } from "@/components/stories/story-blog-header";
import { StoryEngagementBar } from "@/components/stories/story-engagement-bar";
import { StoryCommentSection } from "@/components/stories/story-comment-section";
import { RelatedStories } from "@/components/stories/related-stories";
import { GFMRender } from "@/components/ui/gfm-render";
import { toast } from "sonner";

export default function StoryDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = React.use(params);
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	const {
		currentStory,
		stories,
		isLoading,
		fetchStoryDetail,
		toggleLike,
		addComment,
		deleteStory,
		getStoryPermission,
	} = useStoryStore();

	const [comment, setComment] = useState("");
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isLoggedIn = mounted ? useAuthStore.getState().is_logged_in() : false;
	const profile = mounted ? useAuthStore.getState().profile() : null;

	useEffect(() => {
		fetchStoryDetail(id);
	}, [id, fetchStoryDetail]);

	const { canEdit, canDelete } = getStoryPermission(id);
	const isLiked = profile && currentStory?.liked_by?.includes(profile.id);

	const handleLike = async () => {
		if (!isLoggedIn) {
			toast.error("Please log in to like stories.");
			return;
		}
		await toggleLike(id);
	};

	const handleComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoggedIn) {
			toast.error("Please log in to comment.");
			return;
		}
		if (!comment.trim()) return;

		setIsSubmittingComment(true);
		try {
			await addComment(id, comment);
			setComment("");
			toast.success("Comment added!");
		} catch {
			toast.error("Failed to add comment.");
		}
		setIsSubmittingComment(false);
	};

	const handleDelete = async () => {
		if (!window.confirm("Are you sure you want to delete this story?"))
			return;

		setIsDeleting(true);
		const success = await deleteStory(id);
		if (success) {
			toast.success("Story deleted.");
			router.push("/stories");
		} else {
			toast.error("Failed to delete story.");
		}
		setIsDeleting(false);
	};

	const handleShare = () => {
		if (typeof window === "undefined") return;
		if (navigator.share) {
			navigator.share({
				title: currentStory?.title,
				text: currentStory?.description,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success("Link copied to clipboard!");
		}
	};

	if (isLoading && !currentStory) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		);
	}

	if (!currentStory) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
					<Card className="p-8 text-center">
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Story not found
						</h2>
						<p className="text-muted-foreground mb-6">
							The story you're looking for doesn't exist or has
							been deleted.
						</p>
						<Button asChild variant="outline">
							<Link href="/stories" className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back to stories
							</Link>
						</Button>
					</Card>
				</main>
			</div>
		);
	}

	const relatedStories = stories.filter((s) => s.id !== id).slice(0, 6);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<article className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
				{/* Back Button */}
				<Link
					href="/stories"
					className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
					<ArrowLeft className="h-4 w-4" />
					Back to stories
				</Link>

				{/* Blog Header */}
				<StoryHeader
					title={currentStory.title}
					description={currentStory.description}
					featureImage={currentStory.feature_image}
					category={currentStory.categories}
					author={currentStory.author}
					createdAt={currentStory.created_at}
				/>

				{/* Story Actions */}
				<div className="mt-8 flex items-center gap-2 justify-between mb-8">
					<StoryEngagementBar
						likesCount={currentStory.likes_count || 0}
						commentsCount={currentStory.comments_count || 0}
						isLiked={!!isLiked}
						onLike={handleLike}
						onShare={handleShare}
					/>

					{/* Edit/Delete Actions */}
					{(canEdit || canDelete) && (
						<div className="flex gap-2">
							{canEdit && (
								<Button
									asChild
									variant="outline"
									size="sm"
									className="gap-2">
									<Link href={`/stories/edit/${id}`}>
										<Edit3 className="h-4 w-4" />
										Edit
									</Link>
								</Button>
							)}
							{canDelete && (
								<Button
									variant="destructive"
									size="sm"
									onClick={handleDelete}
									disabled={isDeleting}
									className="gap-2">
									<Trash2 className="h-4 w-4" />
									{isDeleting ? "Deleting..." : "Delete"}
								</Button>
							)}
						</div>
					)}
				</div>

				{/* Main Content */}
				<div className="prose prose-sm sm:prose-base max-w-none mb-16">
					<GFMRender content={currentStory.description} />
				</div>

				{/* Divider */}
				<div className="border-t border-border my-12" />

				{/* Comments Section */}
				<StoryCommentSection
					comments={currentStory.comments || []}
					isLoading={false}
					newComment={comment}
					onCommentChange={setComment}
					onSubmitComment={handleComment}
					isSubmitting={isSubmittingComment}
					isLoggedIn={isLoggedIn}
				/>

				{/* Divider */}
				<div className="border-t border-border my-12" />

				{/* Related Stories */}
				{relatedStories.length > 0 && (
					<RelatedStories stories={relatedStories} />
				)}
			</article>
		</div>
	);
}
