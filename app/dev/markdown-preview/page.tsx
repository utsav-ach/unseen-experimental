"use client";

import { useState } from "react";
import { GFMEditor } from "@/components/ui/gfm-editor";
import { GFMRender } from "@/components/ui/gfm-render";
import { GFMInputField } from "@/components/ui/gfm-input-field";
import { Card } from "@/components/ui/card";

export default function MarkdownTester() {
	const [markdownText, setMarkdownText] = useState<string>(
		`# Unseen Nepal Explorers\n\nWelcome to the **Himalayan GFM Engine**.\n\n## Syntax Support Highlights:\n- Robust bolding, *italics*, and ~~strikethrough~~.\n- Inline \`code blocks\` and code blocks.\n- Intelligent Table rendering.\n- Auto-link extraction and **rehype-sanitize** validation.\n\n> This editor natively renders Github-Flavored Markdown securely on both edit and view screens. Enjoy drafting your feature descriptions.\n`,
	);

	// Mock image upload to simulate the cloud pipeline
	const handleImageUpload = async (file: File) => {
		return new Promise<string>((resolve) => {
			setTimeout(() => {
				// Return a dummy public cloud URL for testing
				resolve(`https://dummycloud.com/uploaded-${file.name}`);
			}, 1500);
		});
	};

	const handleSave = async (finalMarkdown: string) => {
		// Here the urls will have been replaced by the dummy cloud urls automatically by the editor
		setMarkdownText(finalMarkdown);
		alert(
			"Markdown Saved! Check the preview to see the resolved uploaded dummy URLs.",
		);
	};

	return (
		<main className="min-h-screen bg-background text-foreground flex flex-col p-8 md:p-16 max-w-7xl mx-auto space-y-12">
			<div>
				<h1 className="text-4xl font-black tracking-tighter uppercase">
					GFM Component Live Sandbox
				</h1>
				<p className="text-muted-foreground mt-2 font-bold tracking-widest text-sm">
					TESTING MD-EDITOR AND MARKDOWN-PREVIEW SYNC
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
				<div className="space-y-4">
					<h3 className="font-bold uppercase tracking-widest text-primary text-xs flex justify-between">
						<span>GFM Input Field Hybrid Widget</span>
					</h3>
					<GFMInputField
						label="Destination Description"
						infoText="You can use basic text, or toggle 'Rich Editor Mode' to draft full GitHub-Flavored Markdown components with live image syncs!"
						error={
							markdownText.length < 10
								? "Description is too short."
								: null
						}
						isRequired
						value={markdownText}
						onChange={(val) => setMarkdownText(val || "")}
						acceptImage={true}
						onImageUpload={handleImageUpload}
						onSave={handleSave}
						className="shadow-xl shadow-black/10"
					/>
				</div>

				<div className="space-y-4">
					<h3 className="font-bold uppercase tracking-widest text-primary text-xs">
						GFMRender Output
					</h3>
					<Card className="p-8 rounded-none bg-card border border-border overflow-y-auto h-[600px] shadow-inner shadow-black/40">
						<GFMRender content={markdownText} />
					</Card>
				</div>
			</div>
		</main>
	);
}
