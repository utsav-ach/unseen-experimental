"use client";

import dynamic from "next/dynamic";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Dynamically import MDPreview without SSR
const MDPreview = dynamic(
	() => import("@uiw/react-markdown-preview").then((mod) => mod.default),
	{ ssr: false },
);

interface GFMRenderProps {
	content: string;
	className?: string;
}

export function GFMRender({ content, className }: GFMRenderProps) {
	return (
		<div data-color-mode="dark" className={className}>
			<MDPreview
				source={content}
				rehypePlugins={[
					[
						rehypeSanitize,
						{
							...defaultSchema,
							protocols: {
								...defaultSchema.protocols,
								src: [
									...(defaultSchema.protocols?.src || []),
									"blob",
									"data",
								],
							},
						},
					],
				]}
				className="!bg-transparent text-sm w-full font-sans leading-relaxed"
			/>
		</div>
	);
}

export default GFMRender;
