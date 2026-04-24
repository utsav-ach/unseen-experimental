"use client";

import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function StoryEngagementBar({
	likesCount,
	commentsCount,
	isLiked,
	onLike,
	onShare,
}: {
	likesCount: number;
	commentsCount: number;
	isLiked: boolean;
	onLike: () => void;
	onShare: () => void;
}) {
	return (
		<div className="rounded-lg border bg-card p-4 sm:p-6">
			<div className="flex flex-wrap items-center gap-3 sm:gap-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={onLike}
					className="flex items-center gap-2 group">
					<Heart
						className={`h-5 w-5 transition-colors ${
							isLiked
								? "fill-red-500 text-red-500"
								: "text-muted-foreground group-hover:text-red-500"
						}`}
					/>
					<span className="text-sm font-medium">{likesCount}</span>
				</Button>

				<Separator orientation="vertical" className="h-6" />

				<div className="flex items-center gap-2 text-muted-foreground">
					<MessageSquare className="h-5 w-5" />
					<span className="text-sm font-medium">{commentsCount}</span>
				</div>

				<Separator orientation="vertical" className="h-6" />

				<Button
					variant="ghost"
					size="sm"
					onClick={onShare}
					className="flex items-center gap-2 group">
					<Share2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
					<span className="text-sm font-medium">Share</span>
				</Button>
			</div>
		</div>
	);
}
