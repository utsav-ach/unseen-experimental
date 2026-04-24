"use client";

import React, { useEffect, useState } from "react";
import { useBookingRequestStore } from "@/backend/v2/stores/useBookingRequestStore";
import { Guard } from "@/components/auth/auth-initializer";
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Loader2,
	MapPin,
	Users,
	Calendar,
	MessageSquare,
	ArrowUpRight,
	CheckCircle2,
	Clock,
	XCircle,
	Info,
	ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";

/**
 * TouristRequestsPage
 * Dashboard for tourists to track their sent guide negotiation requests.
 */
export default function TouristRequestsPage() {
	return (
		<Guard fallbackMessage="booking requests page">
			<TouristDashboard />
		</Guard>
	);
}

function TouristDashboard() {
	const { myRequests, fetchMyRequests, isLoading, finalizeRequest } =
		useBookingRequestStore();

	useEffect(() => {
		fetchMyRequests();
	}, [fetchMyRequests]);

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<div className="min-h-screen bg-background pb-32">
			<header className="border-b border-border bg-card/10 backdrop-blur-xl sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link
						href="/profile"
						className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 hover:opacity-100 transition-opacity">
						Expedition Archives
					</Link>
					<div className="flex items-center gap-4">
						<div className="h-4 w-px bg-border/60" />
						<Badge
							variant="outline"
							className="text-[9px] font-black uppercase tracking-tighter border-primary/20 text-primary px-2">
							Secure Tracking
						</Badge>
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-6 mt-16 space-y-12">
				<div className="space-y-4">
					<h1 className="text-5xl font-display font-black tracking-tighter uppercase leading-none">
						My Negotiations
					</h1>
					<p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
						Track your pending inquiries and finalize agreements
						with guides. Confirm your deployments once terms are
						settled.
					</p>
				</div>

				{isLoading && myRequests.length === 0 ? (
					<div className="py-20 flex flex-col items-center gap-6">
						<Loader2 className="h-10 w-10 animate-spin text-primary/20" />
						<p className="text-[10px] font-black uppercase tracking-widest opacity-20">
							Pulling Secure Records...
						</p>
					</div>
				) : myRequests.length === 0 ? (
					<Card className="rounded-[3rem] border-dashed border-2 border-border/40 p-20 text-center bg-muted/5">
						<div className="h-16 w-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
							<Info className="h-8 w-8 opacity-20" />
						</div>
						<h2 className="text-xl font-bold text-foreground/40 mb-2">
							No Negotiations Found
						</h2>
						<p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">
							Start exploring and initiate a negotiation with a
							guide.
						</p>
						<Link
							href="/trek-dai"
							className="inline-block mt-8 text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
							Browse Guides →
						</Link>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{myRequests.map((request) => (
							<TouristRequestCard
								key={request.id}
								request={request}
								onFinalize={finalizeRequest}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	);
}

function TouristRequestCard({
	request,
	onFinalize,
}: {
	request: any;
	onFinalize: any;
}) {
	const [isFinalizing, setIsFinalizing] = useState(false);
	const [remarks, setRemarks] = useState("");

	const handleAction = async (status: "confirmed" | "cancelled") => {
		const success = await onFinalize(request.id, status, { remarks });
		if (success) {
			toast.success(
				`Negotiation ${status === "confirmed" ? "confirmed" : "cancelled"}.`,
			);
			setIsFinalizing(false);
		}
	};

	const statusConfig = {
		pending: {
			icon: Clock,
			color: "text-yellow-500",
			bg: "bg-yellow-500/10",
			border: "border-yellow-200",
		},
		approved: {
			icon: CheckCircle2,
			color: "text-green-500",
			bg: "bg-green-500/10",
			border: "border-green-200",
		},
		rejected: {
			icon: XCircle,
			color: "text-red-500",
			bg: "bg-red-500/10",
			border: "border-red-200",
		},
		confirmed: {
			icon: ShieldCheck,
			color: "text-primary",
			bg: "bg-primary/10",
			border: "border-primary/20",
		},
		cancelled: {
			icon: Info,
			color: "text-muted-foreground",
			bg: "bg-muted",
			border: "border-border",
		},
	};

	const config =
		statusConfig[request.status as keyof typeof statusConfig] ||
		statusConfig.pending;

	return (
		<Card className="rounded-[2.5rem] border-border bg-card shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
			<CardHeader className="p-8 pb-4">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 rounded-2xl bg-muted border border-border shadow-sm overflow-hidden flex items-center justify-center">
							{request.guide?.avatar_url ? (
								<img
									src={request.guide.avatar_url}
									className="h-full w-full object-cover"
								/>
							) : (
								<Users className="h-5 w-5 opacity-20" />
							)}
						</div>
						<div>
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
								Assigned Guide
							</p>
							<h3 className="text-sm font-black uppercase tracking-tight">
								{request.guide?.first_name ||
									request.guide?.username}
							</h3>
						</div>
					</div>
					<Badge
						className={cn(
							"text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
							config.bg,
							config.color,
							config.border,
						)}>
						{request.status}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="p-8 pt-0 space-y-6">
				<div className="space-y-4">
					<div className="flex items-center gap-3 text-[11px] font-bold opacity-70">
						<MapPin className="h-3.5 w-3.5 opacity-30" />
						<span className="truncate">{request.destinations}</span>
					</div>
					<div className="flex items-center gap-3 text-[11px] font-bold opacity-70">
						<Calendar className="h-3.5 w-3.5 opacity-30" />
						<span>{request.duration_days} Day Expedition</span>
					</div>
				</div>

				{request.status === "approved" && (
					<div className="p-6 rounded-3xl bg-primary/5 border-2 border-primary/10 space-y-4 animate-in slide-in-from-top-2">
						<div className="flex justify-between items-center">
							<span className="text-[9px] font-black uppercase tracking-widest opacity-40">
								Quoted Cost
							</span>
							<span className="text-sm font-black uppercase">
								Rs. {request.total_cost}
							</span>
						</div>
						{request.guide_remarks && (
							<p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed border-t border-primary/10 pt-4 mt-4">
								"{request.guide_remarks}"
							</p>
						)}
					</div>
				)}
			</CardContent>

			<CardFooter className="p-8 pt-0">
				{request.status === "approved" ? (
					<Dialog open={isFinalizing} onOpenChange={setIsFinalizing}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-sm border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all">
								Review & Confirm Proposal
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-xl rounded-[3rem] p-10 border-border bg-background shadow-2xl">
							<DialogHeader className="mb-10">
								<DialogTitle className="text-3xl font-display font-black tracking-tighter uppercase mb-2">
									Seal Agreement
								</DialogTitle>
								<DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-40">
									Finalize your deployment for ABC Trek with{" "}
									{request.guide?.first_name}
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-8">
								<div className="p-8 rounded-[2.5rem] bg-muted/20 border border-border/40 space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
											Total Commitment
										</span>
										<span className="text-xl font-black uppercase text-primary">
											Rs. {request.total_cost}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
											Prepay Bond Required
										</span>
										<span className="text-sm font-bold uppercase">
											Rs. {request.prepay_amount}
										</span>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2 mb-2 text-primary opacity-60">
										<MessageSquare className="h-3 w-3" />
										<span className="text-[9px] font-black uppercase tracking-widest">
											Final Remarks
										</span>
									</div>
									<textarea
										placeholder="Add any final confirmation notes or gear status..."
										className="w-full min-h-[100px] rounded-[2rem] bg-muted/10 border border-border/40 focus:border-primary p-6 text-sm outline-none transition-all"
										value={remarks}
										onChange={(e) =>
											setRemarks(e.target.value)
										}
									/>
								</div>
							</div>

							<DialogFooter className="pt-10 flex gap-4">
								<Button
									variant="outline"
									className="h-16 flex-1 rounded-[2rem] font-black uppercase tracking-widest"
									onClick={() => handleAction("cancelled")}>
									Cancel Request
								</Button>
								<Button
									className="h-16 flex-1 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
									onClick={() => handleAction("confirmed")}>
									Confirm Deployment
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				) : (
					<Button
						variant="ghost"
						className="w-full h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest opacity-30 italic"
						disabled>
						Status: Locked on {request.status}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
