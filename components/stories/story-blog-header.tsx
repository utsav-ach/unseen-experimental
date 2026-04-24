"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

export function StoryHeader({
	title,
	description,
	featureImage,
	category,
	author,
	createdAt,
}: {
	title: string;
	description: string;
	featureImage?: string | null;
	category?: string | null;
	author?: {
		name?: string;
		username?: string | null;
		avatar?: string | null;
	} | null;
	createdAt: string;
}) {
	const authorName = author?.name || author?.username || "Anonymous";
	const authorAvatar =
		author?.avatar ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;

	return (
		<article className="space-y-6">
			{/* Category Badge */}
			{category && (
				<div className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
					{category}
				</div>
			)}

			{/* Title */}
			<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
				{title}
			</h1>

			{/* Metadata Row */}
			<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-3">
					<div className="relative w-10 h-10 rounded-full overflow-hidden">
						<Image
							src={authorAvatar}
							alt={authorName}
							fill
							className="object-cover"
						/>
					</div>
					<div>
						<p className="font-semibold text-foreground">
							{authorName}
						</p>
					</div>
				</div>

				<span className="text-muted-foreground/50">•</span>

				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4" />
					{format(new Date(createdAt), "MMMM dd, yyyy")}
				</div>

				{/* Reading time estimate */}
				<span className="text-muted-foreground/50">•</span>
				<span>
					{Math.ceil((description.split(" ").length || 0) / 200)} min
					read
				</span>
			</div>

			{/* Description/Excerpt */}
			{description && (
				<p className="text-lg text-muted-foreground leading-relaxed italic max-w-3xl">
					{description}
				</p>
			)}

			{/* Feature Image */}
			{featureImage && (
				<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mt-8">
					<Image
						src={featureImage}
						alt={title}
						fill
						className="object-cover"
						priority
					/>
				</div>
			)}
		</article>
	);
}
