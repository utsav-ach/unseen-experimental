"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	User,
	AtSign,
	Phone,
	AlertCircle,
	Check,
	LifeBuoy,
	BadgeCheck,
	Globe,
	FileText,
	Save,
	X,
	Camera,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useProfileStore } from "@/backend/v2/stores/useProfileStore";
import { profileService } from "@/backend/v2/services/profileService";
import { guideService } from "@/backend/v2/services/guideService";
import { InputField } from "@/components/onboarding/input-field";
import { AvatarPicker } from "@/components/onboarding/image-input";
import { LeafletMap } from "@/components/map/leaflet-map";
import { CountrySelect } from "@/components/ui/country-select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { countries } from "@/lib/data/countries";
import { Guide, Profile } from "@/backend/schemas";
import { GFMInputField } from "@/components/ui/gfm-input-field";

import { Guard } from "@/components/auth/auth-initializer";

export default function EditProfilePage() {
	return (
		<Guard fallbackMessage="profile edit page">
			<EditProfileForm />
		</Guard>
	);
}

function EditProfileForm() {
	const router = useRouter();
	const profile = useAuthStore((state) => state.profile());
	const fetchSession = useAuthStore((state) => state.initialize);
	const fetchMyPrivateData = useProfileStore(
		(state) => state.fetchMyPrivateData,
	);
	const [guideProfile, setGuideProfile] = React.useState<Guide | null>(null);

	const [isSaving, setIsSaving] = React.useState(false);
	const [toast, setToast] = React.useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	// Form State
	const [formData, setFormData] = React.useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		username: "",
		bio: "",
		phone_dial_code: "+977",
		phone_number: "",
		emergency_contact_name: "",
		emergency_phone_dial_code: "+977",
		emergency_phone_number: "",
		avatar_url: "",
		home_location_name: "",
		lat: 27.7172,
		lng: 85.324,
	});

	// Toast Timer
	React.useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	// Populate form data from store on mount
	React.useEffect(() => {
		if (profile) {
			const p = profile;
			const g = guideProfile;

			// Parse phone number
			let dialCode = "+977";
			let phoneNumber = p.phone_number || "";

			const matchedCountry = countries.find((c) =>
				phoneNumber.startsWith(c.dial_code),
			);
			if (matchedCountry) {
				dialCode = matchedCountry.dial_code;
				phoneNumber = phoneNumber.replace(dialCode, "");
			}

			// Parse emergency contact
			let emName = "";
			let emDialCode = "+977";
			let emNumber = "";

			if (p.emergency_contact) {
				const parts = p.emergency_contact.split(":");
				if (parts.length >= 2) {
					emName = parts[0];
					const fullEmPhone = parts[1];
					const matchedEmCountry = countries.find((c) =>
						fullEmPhone.startsWith(c.dial_code),
					);
					if (matchedEmCountry) {
						emDialCode = matchedEmCountry.dial_code;
						emNumber = fullEmPhone.replace(emDialCode, "");
					} else {
						emNumber = fullEmPhone;
					}
				}
			}

			// Handle location
			let lat = 27.7172;
			let lng = 85.324;
			if (
				p.home_location &&
				typeof p.home_location === "object" &&
				"coordinates" in p.home_location
			) {
				lng = p.home_location.coordinates[0];
				lat = p.home_location.coordinates[1];
			}

			setFormData({
				first_name: p.first_name || "",
				middle_name: p.middle_name || "",
				last_name: p.last_name || "",
				username: p.username || "",
				bio: g?.description || "",
				phone_dial_code: dialCode,
				phone_number: phoneNumber,
				emergency_contact_name: emName,
				emergency_phone_dial_code: emDialCode,
				emergency_phone_number: emNumber,
				avatar_url: p.avatar_url || "",
				home_location_name: p.home_location_name || "",
				lat,
				lng,
			});
		}
	}, [profile, guideProfile]);

	React.useEffect(() => {
		const loadGuideProfile = async () => {
			if (!profile?.id || !profile.is_guide) {
				setGuideProfile(null);
				return;
			}

			const result = await guideService.getByUserId(profile.id);
			if (result.isSuccess && result.data) {
				setGuideProfile(result.data as Guide);
			}
		};

		loadGuideProfile();
	}, [profile?.id, profile?.is_guide]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile?.id) return;

		setIsSaving(true);
		setToast(null);

		try {
			const fullPhone = `${formData.phone_dial_code}${formData.phone_number}`;
			const fullEmergency = `${formData.emergency_contact_name}:${formData.emergency_phone_dial_code}${formData.emergency_phone_number}`;

			const profileUpdates = {
				first_name: formData.first_name,
				middle_name: formData.middle_name,
				last_name: formData.last_name,
				username: formData.username,
				phone_number: fullPhone,
				emergency_contact: fullEmergency,
				home_location_name: formData.home_location_name,
				home_location: `POINT(${formData.lng} ${formData.lat})`,
				avatar_url: formData.avatar_url,
			} as Partial<Profile>;

			const result = await profileService.update(
				profile.id,
				profileUpdates,
			);

			if (!result.isSuccess) {
				throw new Error(
					result.backendError?.toString() ||
						"Failed to update profile",
				);
			}

			// Update bio if guide
			if (profile.is_guide && guideProfile?.id) {
				const guideResult = await guideService.updateGuide(
					guideProfile.id,
					{
						description: formData.bio,
					},
				);
				if (!guideResult.isSuccess) {
					console.warn(
						"Failed to update bio, but profile was updated.",
					);
				}
			}

			setToast({
				message: "Profile saved successfully! Redirecting...",
				type: "success",
			});
			// Refresh stores
			await fetchSession();
			await fetchMyPrivateData(profile.id);

			setTimeout(() => {
				router.push("/profile");
			}, 1500);
		} catch (err: unknown) {
			setToast({
				message:
					err instanceof Error
						? err.message
						: "An unexpected error occurred",
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-900/50 pb-20 relative overflow-x-hidden">
			{/* Custom Header: High Aesthetic, No messy back button */}
			<div className="w-full  backdrop-blur-3xl border-b border-primary/5 px-8 py-10">
				<div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div className="space-y-1">
						<div className="flex items-center gap-3 mb-2">
							<div className="h-2 w-10 bg-primary rounded-full" />
							<span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
								Adventure Settings
							</span>
						</div>
						<h1 className="text-4xl md:text-5xl font-display font-black text-foreground uppercase tracking-tighter">
							Edit{" "}
							<span className="text-primary italic">Profile</span>
						</h1>
						<p className="text-muted-foreground font-medium text-sm md:text-base">
							Refine your explorer identity on Unseen Nepal
						</p>
					</div>
				</div>
			</div>

			<main className="max-w-4xl mx-auto px-6 pt-12">
				<form onSubmit={handleSave} className="space-y-12">
					{/* Merged Section: Your Profile (Avatar + Identity + Details) */}
					<section className="animate-in fade-in slide-in-from-top-4 duration-1000">
						<Card className="p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/5 border border-primary/5 space-y-12 bg-background relative overflow-hidden">
							<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

							<div className="flex flex-col md:flex-row gap-12 relative z-10">
								<div className="flex-1 space-y-8">
									<div>
										<h2 className="text-2xl font-display font-black text-foreground mb-1 uppercase tracking-tight">
											Public Identity
										</h2>
										<p className="text-sm text-muted-foreground font-medium">
											This is how other user sees you.
										</p>
									</div>

									<div className="shrink-0 group relative">
										<AvatarPicker
											value={formData.avatar_url}
											onImageUploaded={(url) =>
												setFormData((prev) => ({
													...prev,
													avatar_url: url,
												}))
											}
											uploadFileApi={async (file) => {
												if (!profile?.id) return null;
												const res =
													await profileService.updateWithFiles(
														profile.id,
														{},
														{
															public: {
																avatar_url:
																	file,
															},
														},
													);
												return (
													res.data?.avatar_url || null
												);
											}}
											label=""
											infoText="Your avatar is visible to guides and other explorers."
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
										<InputField
											label="Username"
											icon={AtSign}
											placeholder="explorer_name"
											value={formData.username}
											onChange={(e) =>
												setFormData((p) => ({
													...p,
													username: e.target.value,
												}))
											}
											isRequired
										/>
										<div className="flex items-center gap-4 px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-primary/5 h-12 mt-auto self-end">
											<BadgeCheck className="h-5 w-5 text-primary" />
											<div className="flex flex-col">
												<span className="text-[9px] font-black uppercase text-muted-foreground leading-none mb-0.5 tracking-wider">
													Account Type
												</span>
												<span className="text-sm font-bold text-foreground capitalize">
													{profile?.is_admin
														? "Admin"
														: profile?.is_guide
															? "Guide"
															: "Traveler"}
												</span>
											</div>
										</div>
									</div>

									<Separator className="opacity-50" />

									{/* Personal Details Merged Here */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
										<InputField
											label="First Name"
											icon={User}
											value={formData.first_name}
											onChange={(e) =>
												setFormData((p) => ({
													...p,
													first_name: e.target.value,
												}))
											}
											isRequired
										/>
										<InputField
											label="Middle Name"
											icon={User}
											placeholder="Optional"
											value={formData.middle_name}
											onChange={(e) =>
												setFormData((p) => ({
													...p,
													middle_name: e.target.value,
												}))
											}
										/>
										<InputField
											label="Last Name"
											icon={User}
											value={formData.last_name}
											onChange={(e) =>
												setFormData((p) => ({
													...p,
													last_name: e.target.value,
												}))
											}
											isRequired
										/>
									</div>

									{profile?.is_guide && (
										<div className="pt-2">
											<GFMInputField
												label="Guide Portfolio / Bio"
												placeholder="Tell explorers about your expertise..."
												value={formData.bio}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														bio: e,
													}))
												}
												className="h-32 items-start pt-4"
											/>
										</div>
									)}
								</div>
							</div>
						</Card>
					</section>

					{/* Section: Contact Details */}
					<section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
						<div className="flex items-center gap-3 px-6">
							<div className="h-6 w-1 bg-primary rounded-full" />
							<h3 className="text-sm font-black tracking-[0.2em] uppercase text-muted-foreground/80">
								Support & Safety
							</h3>
						</div>

						<Card className="p-8 md:p-10 rounded-[3rem] border-primary/5 shadow-xl shadow-primary/5 space-y-12">
							{/* Phone Details: Improved layout for CountrySelect */}
							<div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
								<div className="md:col-span-12 lg:col-span-5">
									<div className="space-y-2 mb-2 px-1">
										<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
											Phone Country
										</p>
									</div>
									<CountrySelect
										value={formData.phone_dial_code}
										onSelect={(c) =>
											setFormData((p) => ({
												...p,
												phone_dial_code: c.dial_code,
											}))
										}
										className="h-14 border-primary/5 bg-neutral-50 dark:bg-neutral-800/50"
									/>
								</div>
								<div className="md:col-span-12 lg:col-span-7">
									<InputField
										label="Primary Contact Number"
										icon={Phone}
										type="tel"
										placeholder="98XXXXXXXX"
										value={formData.phone_number}
										onChange={(e) =>
											setFormData((p) => ({
												...p,
												phone_number: e.target.value,
											}))
										}
										isRequired
										infoText="Used for verification and coordination."
										className="h-14"
									/>
								</div>
							</div>

							<Separator className="opacity-30" />

							{/* Emergency Contact */}
							<div className="space-y-8">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<LifeBuoy className="h-5 w-5 text-primary" />
											<h4 className="font-bold text-foreground text-lg">
												Emergency Contact
											</h4>
										</div>
										<p className="text-xs text-muted-foreground font-medium">
											Used to contact your gurdain or
											known one in case of emergency.
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<InputField
										label="Contact Person Name"
										icon={User}
										placeholder="Relationship - Full Name"
										value={formData.emergency_contact_name}
										onChange={(e) =>
											setFormData((p) => ({
												...p,
												emergency_contact_name:
													e.target.value,
											}))
										}
									/>
									<div className="flex flex-col sm:flex-row gap-3 items-end">
										<div className="w-full sm:w-48 shrink-0">
											<CountrySelect
												value={
													formData.emergency_phone_dial_code
												}
												onSelect={(c) =>
													setFormData((p) => ({
														...p,
														emergency_phone_dial_code:
															c.dial_code,
													}))
												}
												className="h-12"
											/>
										</div>
										<div className="flex-1">
											<InputField
												label="Contact Number"
												icon={Phone}
												type="tel"
												placeholder="Phone Number"
												value={
													formData.emergency_phone_number
												}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														emergency_phone_number:
															e.target.value,
													}))
												}
											/>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</section>

					{/* Section: Base Location */}
					<section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
						<div className="flex items-center gap-3 px-6">
							<div className="h-6 w-1 bg-primary rounded-full" />
							<h3 className="text-sm font-black tracking-[0.2em] uppercase text-muted-foreground/80">
								Explorer Base
							</h3>
						</div>

						<Card className="p-5 rounded-[3rem] border-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
							<div className="mb-6 pt-6 px-6">
								<InputField
									label="Current Base Location"
									icon={Globe}
									placeholder="City, Country"
									value={formData.home_location_name}
									onChange={(e) =>
										setFormData((p) => ({
											...p,
											home_location_name: e.target.value,
										}))
									}
									infoText="Your current residence or starting point."
									className="h-14 bg-neutral-50 dark:bg-neutral-800/50 border-primary/5"
								/>
							</div>
							<div className="rounded-[2.5rem] overflow-hidden border border-primary/10 mx-1 mb-1">
								<LeafletMap
									initialLat={formData.lat}
									initialLng={formData.lng}
									onLocationChange={(lat, lng, address) => {
										setFormData((p) => ({
											...p,
											lat,
											lng,
											home_location_name:
												address || p.home_location_name,
										}));
									}}
									className="h-[450px] border-0 rounded-none shadow-inner"
								/>
							</div>
						</Card>
					</section>

					{/* Form Actions */}
					<div className="flex flex-col sm:flex-row gap-4 pt-8">
						<Button
							type="submit"
							disabled={isSaving}
							className="flex-1 h-16 rounded-[1.5rem] bg-primary hover:bg-primary-dark text-white font-black text-xl transition-all shadow-2xl shadow-primary/20 gap-3 group">
							{isSaving ? (
								<span className="animate-pulse">
									Syncing...
								</span>
							) : (
								<>
									<Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
									<span>Save Profile</span>
								</>
							)}
						</Button>
						<Button
							type="button"
							onClick={() => router.back()}
							disabled={isSaving}
							variant="outline"
							className="h-16 rounded-[1.5rem] border-2 font-black text-xl px-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border-primary/10">
							Back
						</Button>
					</div>
				</form>
			</main>

			{/* Premium Toast Notification System */}
			<AnimatePresence>
				{toast && (
					<motion.div
						initial={{ opacity: 0, y: 100, scale: 0.8 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{
							opacity: 0,
							scale: 0.5,
							transition: { duration: 0.2 },
						}}
						className="fixed bottom-10 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
						<div
							className={`
                            pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-[2rem] shadow-2xl backdrop-blur-3xl border
                            ${
								toast.type === "success"
									? "bg-primary/90 text-white border-primary/20"
									: "bg-destructive/90 text-white border-destructive/20"
							}
                        `}>
							<div className="bg-white/20 p-2 rounded-full">
								{toast.type === "success" ? (
									<Check className="h-5 w-5" />
								) : (
									<AlertCircle className="h-5 w-5" />
								)}
							</div>
							<span className="font-bold text-sm md:text-base pr-4 line-clamp-1">
								{toast.message}
							</span>
							<button
								onClick={() => setToast(null)}
								className="ml-auto hover:bg-white/10 p-1 rounded-full transition-colors">
								<X className="h-5 w-5" />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
