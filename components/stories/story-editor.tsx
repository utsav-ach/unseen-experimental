"use client";

import React, { useState, useEffect } from "react";
import {
	Camera,
	Tag,
	ArrowLeft,
	Loader2,
	X,
	Image as ImageIcon,
	Layout,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { storyService } from "@/backend/v2/services/storyService";
import { GFMInputField } from "@/components/ui/gfm-input-field";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/onboarding/input-field";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface StoryFormData {
	title: string;
	content: string;
	tags: string[];
	categoriesString: string | null;
	featureImage: File | string | null;
}

export interface StoryEditorProps {
	initialData?: {
		title: string;
		content: string;
		tags: string;
		categories: string[];
		featureImage: File | string | null;
		imagePreview: string | null;
	};
	pageTitle: React.ReactNode;
	pageDescription: string;
	cancelLink: { href: string; label: string };
	submitLabel: string;
	SubmitIcon: React.ElementType;
	onSubmit: (data: StoryFormData) => Promise<boolean>;
	storeLoading: boolean;
	storeError: string | null;
}

export function StoryEditor({
	initialData,
	pageTitle,
	pageDescription,
	cancelLink,
	submitLabel,
	SubmitIcon,
	onSubmit,
	storeLoading,
	storeError,
}: StoryEditorProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	// Form State
	const [title, setTitle] = useState(initialData?.title || "");
	const [content, setContent] = useState(initialData?.content || "");
	const [tags, setTags] = useState(initialData?.tags || "");
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		initialData?.categories || [],
	);
	const [featureImage, setFeatureImage] = useState<File | string | null>(
		initialData?.featureImage || null,
	);
	const [imagePreview, setImagePreview] = useState<string | null>(
		initialData?.imagePreview || null,
	);

	const categoriesList = [
		"Adventure",
		"Culture",
		"Trekking",
		"Wildlife",
		"Food",
		"Spiritual",
	];

	// Update state if initialData changes (useful when fetched dynamically in edit mode)
	useEffect(() => {
		if (initialData) {
			setTitle(initialData.title);
			setContent(initialData.content);
			setTags(initialData.tags);
			setSelectedCategories(initialData.categories);
			setFeatureImage(initialData.featureImage);
			setImagePreview(initialData.imagePreview);
		}
	}, [initialData]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFeatureImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const addCategory = (val: string) => {
		if (val && !selectedCategories.includes(val)) {
			setSelectedCategories([...selectedCategories, val]);
		}
	};

	const removeCategory = (cat: string) => {
		setSelectedCategories(selectedCategories.filter((c) => c !== cat));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title || !content || (!featureImage && !initialData)) {
			toast.error(
				"Please fill in all required fields (Featured Image, Title, and Narrative)!",
			);
			return;
		}

		setIsSubmitting(true);
		setLocalError(null);
		try {
			const tagsArray = tags
				.split(",")
				.map((t) => t.trim())
				.filter((t) => t !== "");
			const categoriesString =
				selectedCategories.length > 0
					? selectedCategories.join(", ")
					: null;

			const success = await onSubmit({
				title,
				content,
				tags: tagsArray,
				categoriesString,
				featureImage,
			});

			if (!success) {
				// Return value 'false' implies the parent or store handles displaying the specific error or we show generic here
				setLocalError("Failed to save story. Please try again.");
			}
		} catch (error: any) {
			console.error("Submission error:", error);
			const msg =
				error?.message || "An error occurred during submission.";
			setLocalError(msg);
			toast.error(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInternalImageUpload = async (file: File) => {
		try {
			const url = await storyService.uploadPublicFile(
				file,
				"stories_images",
			);
			return url;
		} catch (error) {
			toast.error("Failed to upload content image");
			throw error;
		}
	};

	return (
		<div className="min-h-screen bg-card/5 py-12 px-6 md:py-24">
			<main className="max-w-4xl mx-auto">
				<Link
					href={cancelLink.href}
					className="inline-flex items-center gap-2 text-muted-foreground/50 hover:text-primary transition-all group mb-12">
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					<span className="text-[10px] font-bold uppercase tracking-widest italic">
						{cancelLink.label}
					</span>
				</Link>

				<div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
					<div className="space-y-2">
						<Badge className="bg-primary/5 text-primary border-primary/10 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest">
							Creator Studio
						</Badge>
						<h1 className="text-4xl md:text-5xl font-display font-black text-foreground uppercase tracking-tight">
							{pageTitle}
						</h1>
					</div>
					<p className="text-muted-foreground font-medium max-w-[300px] text-xs leading-relaxed text-left md:text-right">
						{pageDescription}
					</p>
				</div>

				{(storeError || localError) && (
					<div className="mb-12 p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10 animate-in fade-in slide-in-from-top-4 duration-500">
						<div className="flex items-start gap-4">
							<div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
								<X className="h-5 w-5 text-destructive" />
							</div>
							<div className="space-y-1">
								<h4 className="text-[10px] font-black uppercase tracking-widest text-destructive">
									Submission Error
								</h4>
								<p className="text-xs font-semibold text-destructive/80 leading-relaxed">
									{storeError || localError}
								</p>
							</div>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-12">
					<section className="space-y-4">
						<label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
							01. Cover Visual{" "}
							<span className="text-destructive">*</span>
						</label>
						<Card
							onClick={() =>
								document
									.getElementById("feature-upload")
									?.click()
							}
							className={cn(
								"relative aspect-[21/9] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group",
								imagePreview
									? "border-primary/50 bg-white"
									: "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]",
							)}>
							{imagePreview ? (
								<>
									<Image
										src={imagePreview}
										alt="Preview"
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
										<div className="flex flex-col items-center gap-3">
											<Camera className="h-10 w-10 text-white" />
											<span className="text-white font-bold uppercase tracking-widest text-[10px]">
												Change Cover
											</span>
										</div>
									</div>
								</>
							) : (
								<div className="flex flex-col items-center gap-4 py-12">
									<div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
										<ImageIcon className="h-8 w-8 text-primary opacity-30" />
									</div>
									<div className="text-center">
										<p className="text-xs font-bold text-foreground">
											Select a high-quality featured image
										</p>
										<p className="text-[10px] text-muted-foreground/60 font-medium mt-1">
											PNG, JPG, or WEBP up to 5MB
										</p>
									</div>
								</div>
							)}
						</Card>
						<input
							id="feature-upload"
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleImageChange}
						/>
					</section>

					<section className="space-y-4">
						<InputField
							label="02. Narrative Title"
							isRequired
							placeholder="Give your story a clear and descriptive name..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="h-16 text-lg font-bold rounded-2xl bg-white/50 border-border/50"
						/>
					</section>

					<section className="space-y-4">
						<GFMInputField
							label="03. Your Experience"
							isRequired
							value={content}
							onChange={setContent}
							placeholder="Write your hearts out... Full markdown support with persistent image hosting."
							infoText="Rich Editor Mode allows you to drag-and-drop images directly into your text. All images are hosted in the 'stories_images' cloud bucket."
							className="min-h-[600px] !text-base !font-medium !bg-white/50 !rounded-3xl !border-border/50 shadow-sm"
							acceptImage={true}
							onImageUpload={handleInternalImageUpload}
						/>
					</section>

					<section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-primary/5">
						<div className="space-y-4">
							<InputField
								label="04. Metadata Tags"
								icon={Tag}
								placeholder="Adventure, Wildlife, Local..."
								infoText="Separate tags with commas to help others find your stories."
								value={tags}
								onChange={(e) => setTags(e.target.value)}
								className="h-14 font-medium rounded-2xl bg-white/50"
							/>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between items-center mb-2 px-1">
								<label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
									05. Categories
								</label>
							</div>
							<div className="flex gap-3">
								<Select onValueChange={addCategory}>
									<SelectTrigger className="flex-1 h-14 rounded-2xl bg-white/50 border-border font-bold text-[10px] uppercase tracking-widest">
										<div className="flex items-center gap-2">
											<Layout className="h-4 w-4 text-primary opacity-50" />
											<SelectValue placeholder="Add Category" />
										</div>
									</SelectTrigger>
									<SelectContent className="rounded-xl border-primary/5 p-1 shadow-xl">
										{categoriesList.map((cat) => (
											<SelectItem
												key={cat}
												value={cat}
												className="rounded-lg py-2 font-bold uppercase tracking-widest text-[9px]">
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-wrap gap-2 pt-2">
								{selectedCategories.length > 0 ? (
									selectedCategories.map((cat) => (
										<Badge
											key={cat}
											className="bg-primary/5 text-primary border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 group">
											<span className="text-[9px] font-bold uppercase tracking-widest">
												{cat}
											</span>
											<button
												type="button"
												onClick={() =>
													removeCategory(cat)
												}
												className="hover:text-destructive transition-colors">
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))
								) : (
									<p className="text-[10px] font-medium text-muted-foreground opacity-40 px-1">
										No categories selected.
									</p>
								)}
							</div>
						</div>
					</section>

					<div className="pt-12 text-center">
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting || storeLoading}
							className="w-full max-w-sm h-16 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative">
							{isSubmitting || storeLoading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<>
									<span className="relative z-10 flex items-center gap-2">
										{submitLabel}{" "}
										<SubmitIcon className="h-4 w-4" />
									</span>
									<div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
								</>
							)}
						</Button>
						<p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-6 leading-loose">
							By publishing, your story will be shared publicly
							with the Unseen Nepal community. <br />
							Review your content to ensure it meets our
							guidelines.
						</p>
					</div>
				</form>
			</main>
		</div>
	);
}
