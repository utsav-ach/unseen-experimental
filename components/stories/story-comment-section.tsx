"use client";

import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StoryCommentSection({
	comments,
	isLoading,
	newComment,
	onCommentChange,
	onSubmitComment,
	isSubmitting,
	isLoggedIn,
}: {
	comments: Array<{
		id: string;
		content: string;
		created_at: string;
		user?: {
			name?: string;
			username?: string | null;
			avatar?: string | null;
		};
	}>;
	isLoading: boolean;
	newComment: string;
	onCommentChange: (value: string) => void;
	onSubmitComment: (e: React.FormEvent) => void;
	isSubmitting: boolean;
	isLoggedIn: boolean;
}) {
	if (isLoading) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				Loading comments...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h3 className="text-2xl font-bold text-foreground">
				Discussion ({comments.length})
			</h3>

			{/* Comment Form */}
			{isLoggedIn ? (
				<Card className="p-6 space-y-4">
					<form onSubmit={onSubmitComment} className="space-y-4">
						<textarea
							placeholder="Share your thoughts..."
							value={newComment}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => onCommentChange(e.target.value)}
							className="w-full min-h-32 p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<div className="flex justify-end">
							<Button
								disabled={isSubmitting || !newComment.trim()}>
								{isSubmitting ? "Posting..." : "Post comment"}
							</Button>
						</div>
					</form>
				</Card>
			) : (
				<Card className="p-6 text-center text-muted-foreground">
					<p>Please log in to comment on this story.</p>
				</Card>
			)}

			{/* Comments List */}
			<div className="space-y-4">
				{comments.length === 0 ? (
					<p className="text-center py-8 text-muted-foreground">
						No comments yet. Be the first to share your thoughts!
					</p>
				) : (
					comments.map((comment) => {
						const userName =
							comment.user?.name ||
							comment.user?.username ||
							"Anonymous";
						const userAvatar =
							comment.user?.avatar ||
							`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

						return (
							<Card key={comment.id} className="p-4 sm:p-6">
								<div className="flex gap-4">
									<div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
										<Image
											src={userAvatar}
											alt={userName}
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between gap-2">
											<p className="font-semibold text-foreground text-sm">
												{userName}
											</p>
											<p className="text-xs text-muted-foreground">
												{new Date(
													comment.created_at,
												).toLocaleDateString()}
											</p>
										</div>
										<p className="text-sm text-muted-foreground mt-2 leading-relaxed">
											{comment.content}
										</p>
									</div>
								</div>
							</Card>
						);
					})
				)}
			</div>
		</div>
	);
}
