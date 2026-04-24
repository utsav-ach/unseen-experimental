"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useGuideApplicationStore } from "@/backend/v2/stores/useGuideApplicationStore";
import { Guard } from "@/components/auth/auth-initializer";
import { InputField } from "@/components/onboarding/input-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

function GuideRegistrationForm() {
	const router = useRouter();
	const profile = useAuthStore((state) => state.profile());

	const {
		submitApplication,
		fetchMyApplications,
		myApplications,
		isLoading,
		error,
	} = useGuideApplicationStore();

	const [isChecking, setIsChecking] = useState(true);

	const [idType, setIdType] = useState("");
	const [idNumber, setIdNumber] = useState("");
	const [description, setDescription] = useState("");
	const [experience, setExperience] = useState("");
	const [languages, setLanguages] = useState("");
	const [idPhoto, setIdPhoto] = useState<File | null>(null);
	const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);

	useEffect(() => {
		const checkCurrentState = async () => {
			if (!profile?.id) return;

			if (profile.is_guide) {
				setIsChecking(false);
				return;
			}

			await fetchMyApplications();
			const latest =
				useGuideApplicationStore.getState().myApplications[0];
			if (latest?.status === "pending") {
				router.push("/guide/register/status");
				return;
			}

			setIsChecking(false);
		};

		checkCurrentState();
	}, [profile, fetchMyApplications, router]);

	const latestApplication = useMemo(
		() => myApplications[0],
		[myApplications],
	);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] || null;
		setIdPhoto(selectedFile);

		if (!selectedFile) {
			setIdPhotoPreview(null);
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => setIdPhotoPreview(reader.result as string);
		reader.readAsDataURL(selectedFile);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const parsedLanguages = languages
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);

		if (!idType) {
			toast.error("Please select your document type.");
			return;
		}

		if (!idNumber.trim()) {
			toast.error("Please enter your document number.");
			return;
		}

		if (!description.trim()) {
			toast.error("Please write a short profile description.");
			return;
		}

		if (!experience.trim()) {
			toast.error("Please provide your guide experience details.");
			return;
		}

		if (parsedLanguages.length === 0) {
			toast.error("Please add at least one language.");
			return;
		}

		if (!idPhoto) {
			toast.error("Please upload your ID document image.");
			return;
		}

		const success = await submitApplication(
			{
				nid_document_type: idType as
					| "citizenship"
					| "nid"
					| "license"
					| "pan"
					| "passport"
					| "voter_id",
				nid_number: idNumber,
				description,
				previous_experience: experience,
				known_languages: parsedLanguages,
			},
			idPhoto,
		);

		if (!success) {
			toast.error(
				useGuideApplicationStore.getState().error ||
					"Could not submit application.",
			);
			return;
		}

		toast.success("Application submitted successfully.");
		router.push("/guide/register/status");
	};

	if (isChecking) {
		return (
			<main className="min-h-screen bg-background">
				<section className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Checking your guide application status...
					</div>
				</section>
			</main>
		);
	}

	if (profile?.is_guide) {
		return (
			<main className="min-h-screen bg-background">
				<section className="mx-auto max-w-2xl px-4 py-16">
					<Card className="space-y-4 rounded-xl border p-6 text-center">
						<h1 className="text-xl font-semibold text-foreground">
							You are already a verified guide
						</h1>
						<p className="text-sm text-muted-foreground">
							Your profile already has guide access. You can go
							directly to request management.
						</p>
						<Button asChild className="mt-2">
							<Link href="/guide/requests">
								Go to guide dashboard
							</Link>
						</Button>
					</Card>
				</section>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background">
			<section className="border-b bg-muted/20">
				<div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-10 md:py-12">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
						Guide registration
					</h1>
					<p className="text-sm text-muted-foreground">
						Submit your identification and experience details. Admin
						review usually takes 48–72 hours.
					</p>
				</div>
			</section>

			<section className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
				{error ? (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Submission error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				{latestApplication?.status === "rejected" ? (
					<Alert className="mb-6 border border-border bg-card">
						<AlertTitle>
							Previous application was rejected
						</AlertTitle>
						<AlertDescription>
							You can submit a new application with corrected
							information and clear documents.
						</AlertDescription>
					</Alert>
				) : null}

				<form onSubmit={handleSubmit} className="space-y-8">
					<Card className="space-y-5 rounded-xl border p-5 md:p-6">
						<h2 className="text-base font-semibold text-foreground">
							Identity details
						</h2>

						<div className="grid gap-5 md:grid-cols-2">
							<div className="space-y-2">
								<label className="text-xs font-medium text-muted-foreground">
									Document type
								</label>
								<Select
									value={idType}
									onValueChange={setIdType}>
									<SelectTrigger className="h-11 w-full rounded-lg bg-background">
										<SelectValue placeholder="Select document" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="citizenship">
											Citizenship
										</SelectItem>
										<SelectItem value="nid">
											National ID
										</SelectItem>
										<SelectItem value="license">
											Driving License
										</SelectItem>
										<SelectItem value="pan">
											PAN Card
										</SelectItem>
										<SelectItem value="passport">
											Passport
										</SelectItem>
										<SelectItem value="voter_id">
											Voter ID
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<InputField
								label="Document number"
								isRequired
								value={idNumber}
								onChange={(event) =>
									setIdNumber(event.target.value)
								}
								placeholder="Enter your document number"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-medium text-muted-foreground">
								ID document photo
							</label>
							<label
								htmlFor="id_photo"
								className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-5 text-center">
								{idPhotoPreview ? (
									<div className="relative h-48 w-full overflow-hidden rounded-md border bg-background md:h-56">
										<Image
											src={idPhotoPreview}
											alt="ID preview"
											fill
											className="object-contain"
										/>
									</div>
								) : (
									<>
										<Upload className="h-5 w-5 text-muted-foreground" />
										<p className="text-sm text-muted-foreground">
											Click to upload clear photo
										</p>
									</>
								)}
							</label>
							<input
								id="id_photo"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
						</div>
					</Card>

					<Card className="space-y-5 rounded-xl border p-5 md:p-6">
						<h2 className="text-base font-semibold text-foreground">
							Guide profile
						</h2>

						<div className="space-y-2">
							<label className="text-xs font-medium text-muted-foreground">
								Short bio
							</label>
							<textarea
								value={description}
								onChange={(event) =>
									setDescription(event.target.value)
								}
								className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2"
								placeholder="Tell us who you are and what places you can guide."
							/>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-medium text-muted-foreground">
								Previous experience
							</label>
							<textarea
								value={experience}
								onChange={(event) =>
									setExperience(event.target.value)
								}
								className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2"
								placeholder="Share your guiding history, routes, or certifications."
							/>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-medium text-muted-foreground">
								Known languages
							</label>
							<textarea
								value={languages}
								onChange={(event) =>
									setLanguages(event.target.value)
								}
								className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2"
								placeholder="Nepali, English, Hindi"
							/>
							<p className="text-xs text-muted-foreground">
								Use commas between languages.
							</p>
						</div>
					</Card>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<Button
							type="submit"
							disabled={isLoading}
							className="h-11 rounded-lg px-6">
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting
								</>
							) : (
								"Submit application"
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							asChild
							className="h-11 rounded-lg px-6">
							<Link href="/guide/register/status">
								View status
							</Link>
						</Button>
					</div>
				</form>
			</section>
		</main>
	);
}

export default function GuideRegistrationPage() {
	return (
		<Guard fallbackMessage="guide registration page">
			<GuideRegistrationForm />
		</Guard>
	);
}
