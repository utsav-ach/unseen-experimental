"use client";

import { useEffect, type ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore, useProfileStore } from "@/backend/v2/stores";
import type { PrivateProfileData, Profile } from "@/backend/schemas";
import {
	Calendar,
	Edit3,
	Heart,
	MessageCircle,
	Clock,
	Loader2,
	BookOpen,
	Tent,
	ArrowUpRight,
	Plus,
	Activity,
	LifeBuoy,
	Phone,
	Mail,
	Globe,
	Camera,
	ClipboardList,
	BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Guard } from "@/components/auth/auth-initializer";

export default function ProfilePage() {
	const profile = useAuthStore((state) => state.profile());
	const { myPrivateData, fetchMyPrivateData, isLoading } = useProfileStore();

	useEffect(() => {
		if (profile?.id) {
			fetchMyPrivateData(profile.id);
		}
	}, [profile?.id, fetchMyPrivateData]);

	return (
		<Guard fallbackMessage="profile page">
			{isLoading && !myPrivateData ? (
				<div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							repeat: Infinity,
							duration: 1,
							ease: "linear",
						}}>
						<Loader2 className="w-12 h-12 text-primary" />
					</motion.div>
					<p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
						Loading profile...
					</p>
				</div>
			) : (
				<ProfileContent
					profileData={profile}
					myPrivateData={myPrivateData}
				/>
			)}
		</Guard>
	);
}

function ProfileContent({
	profileData,
	myPrivateData,
}: {
	profileData?: Profile | null;
	myPrivateData?: PrivateProfileData | null;
}) {
	if (!profileData) return null;

	const {
		profile,
		recent_stories,
		recent_likes,
		recent_comments,
		recent_bookings,
		recent_booking_requests_sent,
		recent_booking_requests_received,
		recent_photos,
		stats,
		guide_application,
		guide_data,
		service_areas_count,
	} = myPrivateData || {
		profile: profileData,
		recent_stories: [],
		recent_likes: [],
		recent_comments: [],
		recent_bookings: [],
		recent_booking_requests_sent: [],
		recent_booking_requests_received: [],
		recent_photos: [],
		stats: {
			stories_count: 0,
			photos_count: 0,
			bookings_count: 0,
			completed_bookings_count: 0,
			booking_requests_sent_count: 0,
			booking_requests_received_count: 0,
		},
		guide_application: null,
		guide_data: null,
		service_areas_count: 0,
	};

	const fullName =
		[profile?.first_name, profile?.middle_name, profile?.last_name]
			.filter(Boolean)
			.join(" ") ||
		profile?.username ||
		"Traveler";

	// Emergency Contact Parsing
	let emName = "Not Set";
	let emPhone = "Not Set";
	if (profile?.emergency_contact) {
		const parts = profile.emergency_contact.split(":");
		if (parts.length >= 2) {
			emName = parts[0];
			emPhone = parts[1];
		}
	}

	return (
		<div className="min-h-screen bg-background pb-20">
			{/* Simple, Full-Width Profile Header */}
			<div className="w-full px-6 md:px-12 pt-32 pb-16 border-b bg-card/30">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12">
					{/* Portrait with proper spacing */}
					<div className="relative group shrink-0">
						<div className="p-1 rounded-full border-4 border-primary/10 group-hover:border-primary/30 transition-all duration-500">
							<Avatar className="w-48 h-48 md:w-56 md:h-56 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
								<AvatarImage
									src={profile?.avatar_url || ""}
									className="object-cover"
								/>
								<AvatarFallback className="bg-muted text-foreground text-5xl font-bold">
									{fullName[0]}
								</AvatarFallback>
							</Avatar>
						</div>
						<div className="absolute bottom-6 right-6 h-8 w-8 rounded-full bg-green-500 border-4 border-background shadow-lg" />
					</div>

					{/* Basic Info & Actions */}
					<div className="flex-1 text-center md:text-left space-y-8 pt-4">
						<div className="space-y-4">
							<div className="flex flex-col md:flex-row md:items-center gap-4">
								<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
									{fullName}
								</h1>
								<Badge
									variant="outline"
									className="w-fit mx-auto md:mx-0 px-4 py-1 font-bold text-sm border-primary/20 text-primary uppercase tracking-widest">
									@{profile?.username}
								</Badge>
							</div>
							<p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
								{guide_data?.description ||
									"Traveling across Nepal to find the best spots."}
							</p>
						</div>

						<div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
							<Button
								asChild
								size="lg"
								className="h-14 px-10 rounded-2xl font-bold text-lg shadow-lg">
								<Link href="/profile/edit">
									<Edit3 className="w-5 h-5 mr-3" />
									Edit profile
								</Link>
							</Button>
							<Button
								variant="secondary"
								size="lg"
								className="h-14 px-10 rounded-2xl font-bold text-lg">
								Share Profile
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Sections */}
			<main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
					{/* Sidebar: Details & Settings */}
					<aside className="lg:col-span-4 space-y-10">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}>
							<Card className="rounded-4xl border-border bg-card shadow-sm overflow-hidden">
								<CardContent className="p-10 space-y-12">
									{/* About me info */}
									<div className="space-y-8">
										<h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
											About me
										</h2>

										<div className="space-y-6">
											<div className="flex items-center gap-5">
												<div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
													<Mail className="w-5 h-5" />
												</div>
												<div className="space-y-1 min-w-0">
													<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
														Email
													</p>
													<p className="font-bold text-foreground truncate">
														{profile?.email ||
															"No email"}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-5">
												<div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
													<Phone className="w-5 h-5" />
												</div>
												<div className="space-y-1">
													<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
														Phone
													</p>
													<p className="font-bold text-foreground text-sm">
														{profile?.phone_number ||
															"Not added"}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-5">
												<div className="bg-primary/10 p-3 rounded-2xl text-primary shrink-0">
													<Globe className="w-5 h-5" />
												</div>
												<div className="space-y-1 font-bold">
													<p className="text-xs text-muted-foreground uppercase tracking-wider">
														Location
													</p>
													<p className="text-foreground text-sm">
														{profile?.home_location_name ||
															"Nepal"}
													</p>
												</div>
											</div>
										</div>
									</div>

									<Separator />

									{/* Emergency Section */}
									<div className="space-y-8">
										<h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
											Emergency Contact
										</h2>
										<div className="bg-muted/50 p-6 rounded-3xl border border-border space-y-4">
											<div className="flex items-center gap-4">
												<LifeBuoy className="w-6 h-6 text-primary" />
												<div className="space-y-1 font-bold">
													<p className="text-foreground">
														{emName}
													</p>
													<p className="text-xs text-muted-foreground">
														{emPhone}
													</p>
												</div>
											</div>
										</div>
									</div>

									<Separator />

									{/* Simple Stats Group */}
									<div className="space-y-8">
										<h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
											Account Stats
										</h2>
										<div className="grid grid-cols-2 gap-4">
											<div className="bg-accent/40 p-6 rounded-3xl border border-border text-center group transition-all">
												<p className="text-4xl font-bold text-foreground">
													{stats?.stories_count ??
														recent_stories.length}
												</p>
												<p className="text-xs font-bold uppercase text-muted-foreground mt-2 tracking-widest">
													Stories
												</p>
											</div>
											<div className="bg-accent/40 p-6 rounded-3xl border border-border text-center group transition-all">
												<p className="text-4xl font-bold text-foreground">
													{stats?.bookings_count ??
														recent_bookings.length}
												</p>
												<p className="text-xs font-bold uppercase text-muted-foreground mt-2 tracking-widest">
													Trips
												</p>
											</div>
											<div className="bg-accent/40 p-6 rounded-3xl border border-border text-center group transition-all">
												<p className="text-4xl font-bold text-foreground">
													{stats?.photos_count ??
														recent_photos.length}
												</p>
												<p className="text-xs font-bold uppercase text-muted-foreground mt-2 tracking-widest">
													Photos
												</p>
											</div>
											<div className="bg-accent/40 p-6 rounded-3xl border border-border text-center group transition-all">
												<p className="text-4xl font-bold text-foreground">
													{stats?.completed_bookings_count ??
														0}
												</p>
												<p className="text-xs font-bold uppercase text-muted-foreground mt-2 tracking-widest">
													Completed
												</p>
											</div>
										</div>
									</div>

									<Separator />

									<div className="space-y-8">
										<h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
											Guide Status
										</h2>
										<div className="bg-muted/50 p-6 rounded-3xl border border-border space-y-4">
											<div className="flex items-center gap-4">
												<BadgeCheck className="w-6 h-6 text-primary" />
												<div className="space-y-1 font-bold">
													<p className="text-foreground">
														{profile?.is_guide ||
														guide_data
															? "Guide profile active"
															: guide_application
																? `Application ${guide_application.status}`
																: "Not applied yet"}
													</p>
													<p className="text-xs text-muted-foreground">
														{profile?.is_guide ||
														guide_data
															? `${service_areas_count || 0} service areas active`
															: guide_application?.admin_feedback ||
																"You can apply once to become a guide."}
													</p>
												</div>
											</div>
										</div>
									</div>

									<Separator />

									{/* Metadata */}
									<div className="space-y-4 pt-2">
										<div className="flex items-center gap-3 text-muted-foreground">
											<Calendar className="w-4 h-4" />
											<span className="text-xs font-medium">
												Joined{" "}
												{profile?.created_at
													? new Date(
															profile.created_at,
														).toLocaleDateString()
													: "Recently"}
											</span>
										</div>
										<div className="flex items-center gap-3 text-muted-foreground">
											<Clock className="w-4 h-4" />
											<span className="text-xs font-medium uppercase tracking-tighter">
												Last Active: Today
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</aside>

					{/* Right Main Content: Activity Hub */}
					<div className="lg:col-span-8">
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}>
							<Tabs defaultValue="bookings" className="w-full">
								<div className="mb-12">
									<TabsList className="bg-muted/50 p-2 rounded-3xl grid grid-cols-3 w-full h-16 md:w-auto md:inline-flex">
										<TabsTrigger
											value="bookings"
											className="data-[state=active]:bg-background data-[state=active]:shadow-xl rounded-2xl h-12 px-10 font-bold transition-all text-sm">
											Trips
										</TabsTrigger>
										<TabsTrigger
											value="stories"
											className="data-[state=active]:bg-background data-[state=active]:shadow-xl rounded-2xl h-12 px-10 font-bold transition-all text-sm">
											Stories
										</TabsTrigger>
										<TabsTrigger
											value="activity"
											className="data-[state=active]:bg-background data-[state=active]:shadow-xl rounded-2xl h-12 px-10 font-bold transition-all text-sm">
											Activity
										</TabsTrigger>
									</TabsList>
								</div>

								{/* Content Sections */}
								<div className="mt-8">
									<TabsContent
										value="bookings"
										className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<Card className="border-border p-6 rounded-2xl bg-card">
												<div className="flex items-center gap-4">
													<div className="p-3 rounded-2xl bg-primary/10 text-primary">
														<ClipboardList className="w-5 h-5" />
													</div>
													<div>
														<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
															Requests Sent
														</p>
														<p className="text-3xl font-bold text-foreground">
															{stats?.booking_requests_sent_count ??
																recent_booking_requests_sent.length}
														</p>
													</div>
												</div>
											</Card>
											<Card className="border-border p-6 rounded-2xl bg-card">
												<div className="flex items-center gap-4">
													<div className="p-3 rounded-2xl bg-primary/10 text-primary">
														<ClipboardList className="w-5 h-5" />
													</div>
													<div>
														<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
															Requests Received
														</p>
														<p className="text-3xl font-bold text-foreground">
															{stats?.booking_requests_received_count ??
																recent_booking_requests_received.length}
														</p>
													</div>
												</div>
											</Card>
										</div>

										{recent_bookings.length === 0 ? (
											<EmptyState
												icon={Tent}
												title="No trips planned"
												description="Check featured destinations to plan one."
												actionLabel="Search trips"
												actionLink="/destinations"
											/>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{recent_bookings.map(
													(booking) => (
														<Card
															key={booking.id}
															className="border-border hover:border-primary/30 transition-all p-8 rounded-2xl bg-card hover:shadow-2xl hover:shadow-primary/5 flex flex-col gap-6">
															<div className="flex items-start justify-between">
																<div className="space-y-2">
																	<h3 className="font-bold text-2xl text-foreground leading-tight!">
																		{booking.destination_name ||
																			"Mountain Trek"}
																	</h3>
																	<div className="flex items-center gap-2">
																		<Badge
																			variant="secondary"
																			className="font-bold text-[10px] uppercase">
																			with{" "}
																			{
																				booking.guide_name
																			}
																		</Badge>
																	</div>
																</div>
																<Badge
																	className={cn(
																		"h-8 rounded-full px-4 text-xs font-bold uppercase",
																		booking.status ===
																			"completed"
																			? "bg-green-500 text-white"
																			: "bg-primary text-white",
																	)}>
																	{
																		booking.status
																	}
																</Badge>
															</div>
															<div className="grid grid-cols-2 gap-4 pt-2">
																<div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
																	<Calendar className="w-4 h-4" />
																	<span>
																		{booking.start_date
																			? new Date(
																					booking.start_date,
																				).toLocaleDateString()
																			: "TBD"}
																	</span>
																</div>
																<div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
																	<Clock className="w-4 h-4" />
																	<span className="capitalize">
																		{
																			booking.status
																		}
																	</span>
																</div>
															</div>
															<Button
																variant="outline"
																className="w-full h-12 rounded-xl border-border hover:bg-muted font-bold text-sm mt-2">
																View booking
																details
															</Button>
														</Card>
													),
												)}
											</div>
										)}

										{(recent_booking_requests_sent.length >
											0 ||
											recent_booking_requests_received.length >
												0) && (
											<div className="space-y-6">
												{recent_booking_requests_sent.length >
													0 && (
													<div className="space-y-4">
														<h3 className="text-lg font-bold text-foreground">
															Recent Requests Sent
														</h3>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															{recent_booking_requests_sent
																.slice(0, 4)
																.map((req) => (
																	<Card
																		key={
																			req.id
																		}
																		className="border-border p-6 rounded-3xl bg-card">
																		<div className="space-y-2">
																			<p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
																				{
																					req.status
																				}
																			</p>
																			<p className="font-semibold text-foreground line-clamp-2">
																				{
																					req.destinations
																				}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				Guide:{" "}
																				{req.guide_name ||
																					"Unknown"}
																			</p>
																		</div>
																	</Card>
																))}
														</div>
													</div>
												)}

												{recent_booking_requests_received.length >
													0 && (
													<div className="space-y-4">
														<h3 className="text-lg font-bold text-foreground">
															Recent Requests
															Received
														</h3>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															{recent_booking_requests_received
																.slice(0, 4)
																.map((req) => (
																	<Card
																		key={
																			req.id
																		}
																		className="border-border p-6 rounded-3xl bg-card">
																		<div className="space-y-2">
																			<p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
																				{
																					req.status
																				}
																			</p>
																			<p className="font-semibold text-foreground line-clamp-2">
																				{
																					req.destinations
																				}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				Tourist:{" "}
																				{req.tourist_name ||
																					"Unknown"}
																			</p>
																		</div>
																	</Card>
																))}
														</div>
													</div>
												)}
											</div>
										)}

										<div className="space-y-4 pt-2">
											<div className="flex items-center gap-3">
												<Camera className="w-5 h-5 text-primary" />
												<h3 className="text-xl font-bold text-foreground">
													Recent Photos
												</h3>
											</div>
											{recent_photos.length === 0 ? (
												<p className="text-sm font-medium text-muted-foreground">
													No photos uploaded yet.
												</p>
											) : (
												<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
													{recent_photos
														.slice(0, 8)
														.map((photo) => (
															<Link
																key={photo.id}
																href={`/photos/${photo.id}`}
																className="group block">
																<Card className="overflow-hidden border-border rounded-2xl">
																	<div className="relative aspect-square overflow-hidden">
																		<Image
																			src={
																				photo
																					.media_urls?.[0] ||
																				"/placeholder.jpg"
																			}
																			alt={
																				photo.description ||
																				"Profile photo"
																			}
																			fill
																			className="object-cover group-hover:scale-105 transition-transform duration-700"
																		/>
																	</div>
																</Card>
															</Link>
														))}
												</div>
											)}
										</div>
									</TabsContent>

									<TabsContent
										value="stories"
										className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
										{recent_stories.length === 0 ? (
											<EmptyState
												icon={BookOpen}
												title="No stories shared"
												description="Share your experience with others."
												actionLabel="Write story"
												actionLink="/stories/create"
											/>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
												{recent_stories.map((story) => (
													<Link
														href={`/stories/${story.id}`}
														key={story.id}
														className="group block">
														<Card className="overflow-hidden border-border group-hover:border-primary/50 transition-all duration-500 rounded-2xl h-full shadow-sm hover:shadow-2xl">
															<div className="relative h-64 overflow-hidden">
																<Image
																	src={
																		story.feature_image ||
																		"/placeholder.jpg"
																	}
																	alt={
																		story.title
																	}
																	fill
																	className="object-cover group-hover:scale-105 transition-transform duration-1000"
																/>
																<div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
																<Badge className="absolute top-6 left-6 bg-white text-black font-bold border-0 px-4 py-1">
																	MY STORY
																</Badge>
															</div>
															<CardContent className="p-8">
																<h3 className="font-bold text-2xl mb-4 leading-snug group-hover:text-primary transition-colors">
																	{
																		story.title
																	}
																</h3>
																<div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground tracking-widest">
																	<div className="flex items-center gap-6">
																		<span className="flex items-center gap-2">
																			<Heart className="w-4 h-4 text-red-500 fill-red-500" />{" "}
																			{
																				story.likes_count
																			}
																		</span>
																		<span className="flex items-center gap-2">
																			<MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />{" "}
																			{
																				story.comments_count
																			}
																		</span>
																	</div>
																	<span>
																		{story.created_at
																			? new Date(
																					story.created_at,
																				).toLocaleDateString()
																			: "Recent"}
																	</span>
																</div>
															</CardContent>
														</Card>
													</Link>
												))}
											</div>
										)}
									</TabsContent>

									<TabsContent
										value="activity"
										className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
										{[...recent_likes, ...recent_comments]
											.length === 0 ? (
											<EmptyState
												icon={Activity}
												title="No recent activity"
												description="Activity will show up here as you interact."
												actionLabel="Go to feed"
												actionLink="/stories"
											/>
										) : (
											<div className="space-y-5">
												{[
													...recent_likes.map(
														(l) => ({
															...l,
															type: "Liked" as const,
															title: l.story_title,
															date: l.created_at,
														}),
													),
													...recent_comments.map(
														(c) => ({
															...c,
															type: "Commented" as const,
															title: c.story_title,
															date: c.created_at,
														}),
													),
												]
													.sort(
														(a, b) =>
															new Date(
																b.date || 0,
															).getTime() -
															new Date(
																a.date || 0,
															).getTime(),
													)
													.map((activity, idx) => (
														<Card
															key={idx}
															className="border-border hover:border-primary/20 transition-all p-8 rounded-3xl bg-card">
															<div className="flex items-center gap-6">
																<div
																	className={cn(
																		"p-4 rounded-full",
																		activity.type ===
																			"Liked"
																			? "bg-red-500/10 text-red-500"
																			: "bg-blue-500/10 text-blue-500",
																	)}>
																	{activity.type ===
																	"Liked" ? (
																		<Heart className="w-6 h-6 fill-red-500" />
																	) : (
																		<MessageCircle className="w-6 h-6 fill-blue-500" />
																	)}
																</div>
																<div className="flex-1 min-w-0">
																	<p className="text-xl font-bold text-foreground overflow-hidden truncate pr-2">
																		{activity.type ===
																		"Liked"
																			? "You liked "
																			: "You commented on "}
																		<span className="text-primary italic">
																			&ldquo;
																			{
																				activity.title
																			}
																			&rdquo;
																		</span>
																	</p>
																	<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-2">
																		<Clock className="w-4 h-4" />
																		{activity.date
																			? new Date(
																					activity.date,
																				).toLocaleDateString()
																			: "Recent"}
																	</p>
																</div>
																<ArrowUpRight className="w-6 h-6 text-muted-foreground/30 hover:text-primary transition-colors cursor-pointer" />
															</div>
														</Card>
													))}
											</div>
										)}
									</TabsContent>
								</div>
							</Tabs>
						</motion.div>
					</div>
				</div>
			</main>
		</div>
	);
}

function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	actionLink,
}: {
	icon: ElementType;
	title: string;
	description: string;
	actionLabel: string;
	actionLink: string;
}) {
	return (
		<Card className="border-border border-dashed bg-muted/20 rounded-[3rem] p-16 text-center space-y-8">
			<div className="bg-background w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary border border-border shadow-sm">
				<Icon className="w-10 h-10" />
			</div>
			<div className="space-y-4 max-w-md mx-auto">
				<h3 className="text-3xl font-bold text-foreground tracking-tight">
					{title}
				</h3>
				<p className="text-lg text-muted-foreground font-medium">
					{description}
				</p>
			</div>
			<Button
				asChild
				size="lg"
				variant="outline"
				className="h-14 px-10 rounded-2xl border-border font-bold text-base transition-all active:scale-95 shadow-sm">
				<Link href={actionLink}>
					{actionLabel} <Plus className="w-5 h-5 ml-2" />
				</Link>
			</Button>
		</Card>
	);
}
