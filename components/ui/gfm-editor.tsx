"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

// Dynamically load MDEditor
const MDEditor = dynamic(
	() => import("@uiw/react-md-editor").then((mod) => mod.default),
	{ ssr: false },
);

interface GFMEditorProps {
	value: string;
	onChange: (value: string | undefined) => void;
	height?: number;
	className?: string;

	// New Feature Props
	acceptImage?: boolean;
	onImageUpload?: (file: File) => Promise<string>;
	onSave?: (savedValue: string) => Promise<void>;
}

export function GFMEditor({
	value,
	onChange,
	height = 400,
	className,
	acceptImage = false,
	onImageUpload,
	onSave,
}: GFMEditorProps) {
	const { resolvedTheme } = useTheme();
	const [blobMap, setBlobMap] = useState<Record<string, File>>({});
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Theme resolution for MDEditor
	const currentTheme =
		resolvedTheme === "dark" || resolvedTheme === "light"
			? resolvedTheme
			: "dark";

	const insertImageBlob = (file: File) => {
		const blobUrl = URL.createObjectURL(file);
		setBlobMap((prev) => ({ ...prev, [blobUrl]: file }));
		const imageMarkdown = `![${file.name}](${blobUrl})\n`;
		onChange((value || "") + "\n" + imageMarkdown);
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
		if (!acceptImage) return;
		const items = e.clipboardData?.items;
		if (!items) return;

		for (let i = 0; i < items.length; i++) {
			if (items[i].type.indexOf("image") !== -1) {
				const file = items[i].getAsFile();
				if (file) {
					e.preventDefault();
					insertImageBlob(file);
				}
			}
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		if (!acceptImage) return;
		const items = e.dataTransfer?.items;
		if (!items) return;

		for (let i = 0; i < items.length; i++) {
			if (items[i].type.indexOf("image") !== -1) {
				const file = items[i].getAsFile();
				if (file) {
					e.preventDefault();
					insertImageBlob(file);
				}
			}
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	// Override the native image button in the toolbar
	useEffect(() => {
		if (!acceptImage) return;

		let timeoutId: NodeJS.Timeout;
		const hijackImageButton = () => {
			const btn = document.querySelector(
				'.w-md-editor-toolbar [data-name="image"]',
			) as HTMLButtonElement | null;
			if (btn && !btn.hasAttribute("data-overridden")) {
				// Use capture phase to intercept React's synthetic event handler
				btn.addEventListener(
					"click",
					(e) => {
						e.stopImmediatePropagation();
						e.preventDefault();
						handleUploadClick();
					},
					true,
				);
				btn.setAttribute("data-overridden", "true");
			} else if (!btn) {
				timeoutId = setTimeout(hijackImageButton, 100);
			}
		};

		hijackImageButton();

		return () => clearTimeout(timeoutId);
	}, [acceptImage]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			insertImageBlob(files[0]);
		}
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleInternalSave = async () => {
		if (!onSave) return;
		setIsSaving(true);
		try {
			let finalMarkdown = value;

			// if we have local blobs, upload them first
			if (
				acceptImage &&
				onImageUpload &&
				Object.keys(blobMap).length > 0
			) {
				const updatedBlobMap = { ...blobMap };

				// Find all local blob URLs in the text
				const blobUrlRegex = /!\[.*?\]\((blob:.*?)\)/g;
				let match;
				while ((match = blobUrlRegex.exec(value)) !== null) {
					const localUrl = match[1];
					const file = updatedBlobMap[localUrl];

					if (file) {
						// Upload and replace
						const cloudUrl = await onImageUpload(file);
						finalMarkdown = finalMarkdown.replace(
							localUrl,
							cloudUrl,
						);
						// cleanup
						delete updatedBlobMap[localUrl];
					}
				}
				setBlobMap(updatedBlobMap); // Keep any unused ones around just in case
			}

			await onSave(finalMarkdown);
		} catch (error) {
			console.error("Save failed:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div
			data-color-mode={currentTheme}
			className={`w-full overflow-hidden border border-border/50 ${!acceptImage ? "hide-image-tool" : ""} ${className || ""}`}
			onPaste={handlePaste}
			onDrop={handleDrop}>
			{/* Custom Toolbar / CSS overrides for the editor wrapper */}
			<style jsx global>{`
				/* Remove circular borders */
				.w-md-editor {
					border-radius: 0 !important;
					box-shadow: none !important;
				}
				/* Bigger toolbar */
				.w-md-editor-toolbar {
					padding: 8px 12px !important;
					height: auto !important;
				}
				.w-md-editor-toolbar li button {
					width: 32px !important;
					height: 32px !important;
				}
				.w-md-editor-toolbar svg {
					width: 16px !important;
					height: 16px !important;
				}
				/* Hide native image command if acceptImage is false */
				.hide-image-tool [data-name="image"] {
					display: none !important;
				}
			`}</style>

			{/* Hidden Input for Manual File Selection */}
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileSelect}
			/>

			<MDEditor
				value={value}
				onChange={(val) => onChange(val)}
				height={height}
				previewOptions={{
					rehypePlugins: [
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
					],
				}}
				className="!bg-background"
				textareaProps={{
					placeholder: acceptImage
						? "Type your markdown here... Paste or drop images directly into the text area!"
						: "Type your markdown here...",
				}}
			/>

			{/* Save Controls */}
			{onSave && (
				<div className="flex items-center justify-between p-4 bg-muted/30 border-t border-border">
					<div className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
						{Object.keys(blobMap).length > 0 ? (
							<span className="text-primary">
								{Object.keys(blobMap).length} Unsaved Images in
								Buffer
							</span>
						) : (
							<span>Markdown Editor Ready</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<Button
							onClick={handleInternalSave}
							disabled={isSaving}
							className="font-bold tracking-widest uppercase text-xs">
							{isSaving ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							{isSaving ? "Saving..." : "Save Content"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default GFMEditor;
