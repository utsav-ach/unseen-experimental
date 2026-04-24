"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AuthState, useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2, MapPin, Save, Upload, User, X } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { InputField } from "./onboarding/input-field";
import { CountrySelect } from "@/components/ui/country-select";
import { countries } from "@/lib/data/countries";
import { toast } from "sonner";

const HomeLocationMap = dynamic(
	() => import("./onboarding/home-location-map"),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-80 items-center justify-center rounded-xl border bg-muted/40 text-sm text-muted-foreground">
				Loading map...
			</div>
		),
	},
);

type ValidationErrors = Partial<
	Record<
		| "avatar"
		| "first_name"
		| "username"
		| "phone_number"
		| "emergency_contact"
		| "home_location",
		string
	>
>;

export function OnboardingForm() {
	const profile = useAuthStore((state: AuthState) => state.profileData);
	const initialAvatarUrl = profile?.avatar_url?.trim() || "";
	const initialUsername = profile?.username?.trim().toLowerCase() || "";

	const [usernameStatus, setUsernameStatus] = useState<
		"idle" | "checking" | "available" | "taken"
	>(initialUsername ? "available" : "idle");
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [generalError, setGeneralError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const previewUrlRef = useRef<string | null>(null);

	const defaultDialCode = useMemo(
		() =>
			countries.find((country) => country.code === "NP")?.dial_code ??
			"+977",
		[],
	);

	const [formData, setFormData] = useState({
		first_name: profile?.first_name ?? "",
		middle_name: profile?.middle_name ?? "",
		last_name: profile?.last_name ?? "",
		username: initialUsername,
		phone_number_local: "",
		emergency_contact_local: "",
		phone_dial_code: defaultDialCode,
		emergency_dial_code: defaultDialCode,
		home_location: "",
		home_location_name: "",
	});
	const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(
		null,
	);

	const onboarding = useAuthStore((state: AuthState) => state.onboarding);
	const checkUsername = useAuthStore(
		(state: AuthState) => state.checkUsername,
	);
	const uploadAvatar = useAuthStore((state: AuthState) => state.uploadAvatar);

	const isLoading = useAuthStore((state: AuthState) => state.isLoading);
	const backendError = useAuthStore((state: AuthState) => state.error);

	const router = useRouter();

	useEffect(() => {
		if (!profile) return;

		setFormData((prev) => ({
			...prev,
			first_name: profile.first_name ?? "",
			middle_name: profile.middle_name ?? "",
			last_name: profile.last_name ?? "",
			username: profile.username?.toLowerCase() ?? "",
		}));

		setAvatarUrl(profile.avatar_url?.trim() || "");

		setUsernameStatus(profile.username ? "available" : "idle");
	}, [profile]);

	useEffect(() => {
		return () => {
			if (previewUrlRef.current) {
				URL.revokeObjectURL(previewUrlRef.current);
			}
		};
	}, []);

	const handleLocationSelect = (lat: number, lng: number) => {
		setFormData((prev) => ({
			...prev,
			home_location: `POINT(${lng} ${lat})`,
		}));
		setErrors((prev) => ({ ...prev, home_location: undefined }));
	};

	const handleLocationNameUpdate = (name: string) => {
		setFormData((prev) => ({ ...prev, home_location_name: name }));
	};

	const avatarPreview = localAvatarPreview || avatarUrl || "";

	const sanitizePhone = (value: string) => value.replace(/[^0-9]/g, "");
	const buildPhoneWithCode = (dialCode: string, localNumber: string) => {
		const normalizedLocal = sanitizePhone(localNumber);
		return normalizedLocal ? `${dialCode} ${normalizedLocal}` : "";
	};

	const validateForm = () => {
		const nextErrors: ValidationErrors = {};

		if (!avatarPreview) {
			nextErrors.avatar = "Profile photo is required.";
		}

		const firstName = formData.first_name.trim();
		if (!firstName) {
			nextErrors.first_name = "First name is required.";
		}

		const username = formData.username.trim().toLowerCase();
		if (!username || username.length < 3) {
			nextErrors.username = "Username must be at least 3 characters.";
		} else if (username.includes(" ")) {
			nextErrors.username = "Username cannot contain spaces.";
		} else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			nextErrors.username =
				"Username can only contain letters, numbers, and underscores.";
		}

		const phoneNumber = sanitizePhone(formData.phone_number_local);
		if (phoneNumber.length < 7) {
			nextErrors.phone_number = "Enter a valid phone number.";
		}

		const emergencyNumber = sanitizePhone(formData.emergency_contact_local);
		if (emergencyNumber.length < 7) {
			nextErrors.emergency_contact =
				"Enter a valid emergency contact number.";
		}

		if (!formData.home_location) {
			nextErrors.home_location = "Select your base location on the map.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const verifyUsername = async () => {
		const normalizedUsername = formData.username.trim().toLowerCase();
		if (!normalizedUsername) {
			setUsernameStatus("idle");
			return false;
		}

		if (normalizedUsername === initialUsername && initialUsername) {
			setUsernameStatus("available");
			return true;
		}

		setUsernameStatus("checking");
		try {
			const isAvailable = await checkUsername(normalizedUsername);
			if (isAvailable) {
				setUsernameStatus("available");
				return true;
			}
			setUsernameStatus("taken");
			setErrors((prev) => ({
				...prev,
				username: "Username is already taken.",
			}));
			return false;
		} catch {
			setUsernameStatus("idle");
			setErrors((prev) => ({
				...prev,
				username: "Could not verify username right now.",
			}));
			return false;
		}
	};

	const handlePickAvatar = () => {
		console.log(
			`Old avatar URL: ${avatarUrl}, Old avatar file: ${avatarFile}`,
		);
	};

	const handleAvatarFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setErrors((prev) => ({
				...prev,
				avatar: "Please choose an image file.",
			}));
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			setErrors((prev) => ({
				...prev,
				avatar: "Image size must be less than 10MB.",
			}));
			return;
		}

		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
		}

		const objectUrl = URL.createObjectURL(file);
		previewUrlRef.current = objectUrl;
		setLocalAvatarPreview(objectUrl);
		setAvatarFile(file);
		setErrors((prev) => ({ ...prev, avatar: undefined }));
	};

	const handleRemoveAvatar = () => {
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
			previewUrlRef.current = null;
		}
		setLocalAvatarPreview(null);
		setAvatarFile(null);
		setAvatarUrl("");
	};

	const handleSubmit = async () => {
		setGeneralError(null);
		setErrors({});

		const valid = validateForm();
		if (!valid) {
			toast.error("Please fix the form errors before continuing.");
			return;
		}

		const usernameOk = await verifyUsername();
		if (!usernameOk) {
			toast.error("Please choose an available username.");
			return;
		}

		let finalAvatarUrl = avatarUrl;
		if (avatarFile) {
			const uploadedUrl = await uploadAvatar(avatarFile);
			if (!uploadedUrl) {
				setGeneralError("Avatar upload failed. Please try again.");
				toast.error("Avatar upload failed. Please try again.");
				return;
			}
			finalAvatarUrl = uploadedUrl;
			setAvatarUrl(uploadedUrl);
		}

		if (!finalAvatarUrl) {
			setErrors((prev) => ({
				...prev,
				avatar: "Profile photo is required.",
			}));
			toast.error("Profile photo is required.");
			return;
		}

		const payload = {
			first_name: formData.first_name.trim(),
			middle_name: formData.middle_name.trim() || null,
			last_name: formData.last_name.trim() || null,
			username: formData.username.trim().toLowerCase(),
			phone_number: buildPhoneWithCode(
				formData.phone_dial_code,
				formData.phone_number_local,
			),
			emergency_contact: buildPhoneWithCode(
				formData.emergency_dial_code,
				formData.emergency_contact_local,
			),
			avatar_url: finalAvatarUrl,
			home_location: formData.home_location,
			home_location_name: formData.home_location_name.trim() || null,
		};

		const success = await onboarding(payload);
		if (!success) {
			setGeneralError(
				backendError ||
					"Could not complete onboarding. Please try again.",
			);
			toast.error(
				backendError ||
					"Could not complete onboarding. Please try again.",
			);
			return;
		}

		toast.success("Profile completed successfully.");
		router.replace("/");
	};

	return (
		<div className="mx-auto w-full max-w-3xl">
			<Card className="rounded-2xl border bg-card shadow-sm">
				<CardHeader className="space-y-2 p-6 sm:p-8">
					<CardTitle className="text-2xl font-semibold tracking-tight">
						Complete your profile
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						Add your public details, contact numbers, and base
						location. This helps guides coordinate safely.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-8 p-6 pt-0 sm:p-8 sm:pt-0">
					{(generalError || backendError) && (
						<div
							className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
							role="alert"
							aria-live="polite">
							{generalError || backendError}
						</div>
					)}

					<section
						className="space-y-4"
						aria-labelledby="avatar-section">
						<h3
							id="avatar-section"
							className="text-sm font-semibold text-foreground">
							Profile photo
						</h3>
						<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
							<Avatar className="h-24 w-24 rounded-full border">
								<AvatarImage
									key={avatarPreview}
									src={avatarPreview}
									alt="Profile preview"
								/>
								<AvatarFallback className="text-sm font-semibold">
									{formData.first_name?.[0]?.toUpperCase() ||
										"U"}
								</AvatarFallback>
							</Avatar>

							<div className="space-y-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleAvatarFileChange}
								/>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={handlePickAvatar}>
										<Upload className="mr-2 h-4 w-4" />
										Choose photo
									</Button>
									{(avatarPreview || avatarFile) && (
										<Button
											type="button"
											variant="ghost"
											onClick={handleRemoveAvatar}>
											<X className="mr-2 h-4 w-4" />
											Remove
										</Button>
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									Your image stays local until you click save.
								</p>
							</div>
						</div>
						{errors.avatar && (
							<p className="text-xs font-medium text-destructive">
								{errors.avatar}
							</p>
						)}
					</section>

					<FieldGroup className="space-y-5">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputField
								label="First name"
								isRequired
								value={formData.first_name}
								onChange={(event) => {
									setFormData((prev) => ({
										...prev,
										first_name: event.target.value,
									}));
									setErrors((prev) => ({
										...prev,
										first_name: undefined,
									}));
								}}
								placeholder="Enter your first name"
								error={errors.first_name}
							/>
							<InputField
								label="Middle name"
								value={formData.middle_name}
								onChange={(event) =>
									setFormData((prev) => ({
										...prev,
										middle_name: event.target.value,
									}))
								}
								placeholder="Optional"
							/>
						</div>

						<InputField
							label="Last name"
							value={formData.last_name}
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									last_name: event.target.value,
								}))
							}
							placeholder="Optional"
						/>

						<InputField
							label="Username"
							isRequired
							icon={User}
							value={formData.username}
							onChange={(event) => {
								setFormData((prev) => ({
									...prev,
									username: event.target.value
										.toLowerCase()
										.replace(/\s/g, "_"),
								}));
								setUsernameStatus("idle");
								setErrors((prev) => ({
									...prev,
									username: undefined,
								}));
							}}
							onBlur={() => {
								if (formData.username.trim().length >= 3) {
									void verifyUsername();
								}
							}}
							placeholder="unique_username"
							error={errors.username}
							infoText="This username is shown publicly in stories and comments."
						/>
						<p
							className="text-xs text-muted-foreground"
							aria-live="polite">
							{usernameStatus === "checking" &&
								"Checking username availability..."}
							{usernameStatus === "available" &&
								"Username is available."}
							{usernameStatus === "taken" &&
								"Username is already taken."}
						</p>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Field className="space-y-2">
								<FieldLabel className="text-xs font-semibold text-muted-foreground">
									Phone number
								</FieldLabel>
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<CountrySelect
										value={formData.phone_dial_code}
										onSelect={(country) =>
											setFormData((prev) => ({
												...prev,
												phone_dial_code:
													country.dial_code,
											}))
										}
										placeholder="Code"
									/>
									<Input
										type="tel"
										inputMode="numeric"
										value={formData.phone_number_local}
										onChange={(event) => {
											setFormData((prev) => ({
												...prev,
												phone_number_local:
													event.target.value,
											}));
											setErrors((prev) => ({
												...prev,
												phone_number: undefined,
											}));
										}}
										placeholder="98XXXXXXXX"
										className="h-12 rounded-xl"
										aria-invalid={Boolean(
											errors.phone_number,
										)}
									/>
								</div>
								{errors.phone_number && (
									<p className="text-xs font-medium text-destructive">
										{errors.phone_number}
									</p>
								)}
							</Field>

							<Field className="space-y-2">
								<FieldLabel className="text-xs font-semibold text-muted-foreground">
									Emergency contact
								</FieldLabel>
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<CountrySelect
										value={formData.emergency_dial_code}
										onSelect={(country) =>
											setFormData((prev) => ({
												...prev,
												emergency_dial_code:
													country.dial_code,
											}))
										}
										placeholder="Code"
									/>
									<Input
										type="tel"
										inputMode="numeric"
										value={formData.emergency_contact_local}
										onChange={(event) => {
											setFormData((prev) => ({
												...prev,
												emergency_contact_local:
													event.target.value,
											}));
											setErrors((prev) => ({
												...prev,
												emergency_contact: undefined,
											}));
										}}
										placeholder="98XXXXXXXX"
										className="h-12 rounded-xl"
										aria-invalid={Boolean(
											errors.emergency_contact,
										)}
									/>
								</div>
								{errors.emergency_contact && (
									<p className="text-xs font-medium text-destructive">
										{errors.emergency_contact}
									</p>
								)}
							</Field>
						</div>

						<Field
							className="space-y-3"
							aria-labelledby="location-heading">
							<div className="flex items-center justify-between">
								<FieldLabel
									id="location-heading"
									className="text-xs font-semibold text-muted-foreground">
									Base location
								</FieldLabel>
								{formData.home_location_name && (
									<p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
										<MapPin className="h-3.5 w-3.5" />
										{formData.home_location_name}
									</p>
								)}
							</div>
							<HomeLocationMap
								onLocationSelect={handleLocationSelect}
								onLocationNameUpdate={handleLocationNameUpdate}
							/>
							{errors.home_location && (
								<p className="text-xs font-medium text-destructive">
									{errors.home_location}
								</p>
							)}
						</Field>
					</FieldGroup>

					<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={
								isLoading || usernameStatus === "checking"
							}>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Save profile
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
