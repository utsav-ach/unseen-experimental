"use client";

import { useMemo, useRef, useState } from "react";
import {
	Bold,
	Italic,
	Underline,
	List,
	ListOrdered,
	Heading1,
	Heading2,
	Heading3,
	Link as LinkIcon,
	Image as ImageIcon,
	Eye,
	Edit3,
	Maximize2,
	Minimize2,
} from "lucide-react";

interface RichTextEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
}

export default function RichTextEditor({
	content,
	onChange,
	placeholder = "Share your experience in detail...",
}: RichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
	const [previewMode, setPreviewMode] = useState(false);
	const [fullscreenMode, setFullscreenMode] = useState(false);

	const sanitizeEditorHTML = (rawHtml: string) => {
		if (!rawHtml) return "";

		// Fallback for non-browser environments.
		if (typeof window === "undefined") {
			return rawHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(rawHtml, "text/html");

		doc.querySelectorAll(
			"script, iframe, object, embed, link[rel='import']",
		).forEach((node) => {
			node.remove();
		});

		doc.querySelectorAll("*").forEach((element) => {
			[...element.attributes].forEach((attribute) => {
				const name = attribute.name.toLowerCase();
				const value = attribute.value.trim().toLowerCase();

				if (name.startsWith("on")) {
					element.removeAttribute(attribute.name);
					return;
				}

				if (
					(name === "href" || name === "src") &&
					value.startsWith("javascript:")
				) {
					element.removeAttribute(attribute.name);
				}
			});
		});

		return doc.body.innerHTML;
	};

	const safeContent = useMemo(() => sanitizeEditorHTML(content), [content]);

	const executeCommand = (command: string, value?: string) => {
		document.execCommand(command, false, value);
		editorRef.current?.focus();
		updateActiveFormats();
		updateContent();
	};

	const updateActiveFormats = () => {
		const formats = new Set<string>();
		if (document.queryCommandState("bold")) formats.add("bold");
		if (document.queryCommandState("italic")) formats.add("italic");
		if (document.queryCommandState("underline")) formats.add("underline");
		if (document.queryCommandState("insertUnorderedList"))
			formats.add("ul");
		if (document.queryCommandState("insertOrderedList")) formats.add("ol");
		setActiveFormats(formats);
	};

	const updateContent = () => {
		if (editorRef.current) {
			onChange(sanitizeEditorHTML(editorRef.current.innerHTML));
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const imgWrapper = document.createElement("div");
			imgWrapper.className = "image-wrapper";
			imgWrapper.contentEditable = "false";
			imgWrapper.style.margin = "1rem 0";
			imgWrapper.style.textAlign = "center";

			const img = document.createElement("img");
			img.src = event.target?.result as string;
			img.style.maxWidth = "100%";
			img.style.height = "auto";
			img.style.borderRadius = "0.75rem";
			img.style.display = "inline-block";

			imgWrapper.appendChild(img);

			if (editorRef.current) {
				editorRef.current.appendChild(imgWrapper);
				const br = document.createElement("br");
				editorRef.current.appendChild(br);
				updateContent();
			}
		};
		reader.readAsDataURL(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const insertLink = () => {
		const url = prompt("Enter URL:");
		if (url) executeCommand("createLink", url);
	};

	const getPreviewHTML = () => {
		if (!content || content.trim() === "") {
			return `<p class="text-warmGray italic">${placeholder}</p>`;
		}
		return sanitizeEditorHTML(content);
	};

	const ToolbarButton = ({
		onClick,
		active,
		icon: Icon,
		title,
	}: {
		onClick: () => void;
		active?: boolean;
		icon: any;
		title: string;
	}) => (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				onClick();
			}}
			onMouseDown={(e) => e.preventDefault()}
			className={`p-2 rounded-lg border transition-all hover:scale-105 ${
				active
					? "bg-gold/20 border-gold text-gold"
					: "bg-white border-border text-inkSoft hover:border-gold hover:text-gold"
			}`}
			title={title}>
			<Icon className="w-4 h-4" />
		</button>
	);

	return (
		<div
			className={`rich-text-editor-wrapper rounded-xl overflow-hidden border-[1.5px] border-border shadow-sm bg-white ${
				fullscreenMode ? "fixed inset-4 z-50" : ""
			}`}>
			{/* Toolbar */}
			<div className="toolbar bg-[#f8fafc] border-b border-border p-3 flex flex-wrap gap-2">
				{!previewMode && (
					<>
						<ToolbarButton
							onClick={() => executeCommand("bold")}
							active={activeFormats.has("bold")}
							icon={Bold}
							title="Bold"
						/>
						<ToolbarButton
							onClick={() => executeCommand("italic")}
							active={activeFormats.has("italic")}
							icon={Italic}
							title="Italic"
						/>
						<ToolbarButton
							onClick={() => executeCommand("underline")}
							active={activeFormats.has("underline")}
							icon={Underline}
							title="Underline"
						/>
						<div className="w-px h-8 bg-border" />
						<ToolbarButton
							onClick={() =>
								executeCommand("formatBlock", "<h1>")
							}
							icon={Heading1}
							title="Heading 1"
						/>
						<ToolbarButton
							onClick={() =>
								executeCommand("formatBlock", "<h2>")
							}
							icon={Heading2}
							title="Heading 2"
						/>
						<ToolbarButton
							onClick={() =>
								executeCommand("formatBlock", "<h3>")
							}
							icon={Heading3}
							title="Heading 3"
						/>
						<div className="w-px h-8 bg-border" />
						<ToolbarButton
							onClick={() =>
								executeCommand("insertUnorderedList")
							}
							active={activeFormats.has("ul")}
							icon={List}
							title="Bullet List"
						/>
						<ToolbarButton
							onClick={() => executeCommand("insertOrderedList")}
							active={activeFormats.has("ol")}
							icon={ListOrdered}
							title="Numbered List"
						/>
						<div className="w-px h-8 bg-border" />
						<ToolbarButton
							onClick={insertLink}
							icon={LinkIcon}
							title="Insert Link"
						/>
						<ToolbarButton
							onClick={() => fileInputRef.current?.click()}
							icon={ImageIcon}
							title="Upload Image"
						/>
						<div className="w-px h-8 bg-border" />
					</>
				)}
				<ToolbarButton
					onClick={() => setPreviewMode(!previewMode)}
					active={previewMode}
					icon={previewMode ? Edit3 : Eye}
					title={previewMode ? "Edit Mode" : "Preview Mode"}
				/>
				<ToolbarButton
					onClick={() => setFullscreenMode(!fullscreenMode)}
					active={fullscreenMode}
					icon={fullscreenMode ? Minimize2 : Maximize2}
					title={fullscreenMode ? "Exit Fullscreen" : "Fullscreen"}
				/>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleImageUpload}
					className="hidden"
				/>
			</div>

			{/* Content Area */}
			{previewMode ? (
				<div
					className={`preview-content p-6 text-ink leading-relaxed bg-cream ${
						fullscreenMode
							? "h-[calc(100vh-120px)] overflow-y-auto"
							: "min-h-[300px]"
					}`}>
					<div
						className="article-preview max-w-4xl mx-auto prose prose-lg"
						dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
					/>
				</div>
			) : (
				<div
					ref={editorRef}
					contentEditable
					onInput={updateContent}
					onMouseUp={updateActiveFormats}
					onKeyUp={updateActiveFormats}
					onPaste={(e) => {
						e.preventDefault();
						const text = e.clipboardData.getData("text/plain");
						document.execCommand("insertText", false, text);
					}}
					className={`editor-content p-4 text-ink text-sm leading-relaxed outline-none ${
						fullscreenMode
							? "h-[calc(100vh-120px)] overflow-y-auto"
							: "min-h-[300px]"
					} empty:before:content-[attr(data-placeholder)] empty:before:text-warmGray empty:before:italic`}
					data-placeholder={placeholder}
					suppressContentEditableWarning
					dangerouslySetInnerHTML={{ __html: safeContent }}
				/>
			)}

			<style jsx>{`
				.prose h1 {
					font-size: 2rem;
					font-weight: 700;
					margin: 1.5rem 0 1rem;
					color: #1a1612;
				}
				.prose h2 {
					font-size: 1.5rem;
					font-weight: 600;
					margin: 1.25rem 0 0.75rem;
					color: #1a1612;
				}
				.prose h3 {
					font-size: 1.25rem;
					font-weight: 600;
					margin: 1rem 0 0.5rem;
					color: #1a1612;
				}
				.prose p {
					margin: 0.75rem 0;
				}
				.prose ul,
				.prose ol {
					margin: 0.75rem 0;
					padding-left: 1.5rem;
				}
				.prose li {
					margin: 0.25rem 0;
				}
				.prose a {
					color: #c9a96e;
					text-decoration: underline;
				}
				.prose img {
					max-width: 100%;
					height: auto;
					border-radius: 0.75rem;
					margin: 1rem auto;
					display: block;
				}
			`}</style>
		</div>
	);
}
