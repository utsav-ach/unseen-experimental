import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RequestStatusBadge } from "./status-badge";

interface BookingRequestCardProps {
	request: any;
	showTourist?: boolean; // if true, show tourist info (guide side), else show guide info (tourist side)
}

export function BookingRequestCard({
	request,
	showTourist = false,
}: BookingRequestCardProps) {
	const isGuideView = showTourist;
	const participantName = isGuideView
		? request.tourist_name
		: request.guide_name;
	const participantAvatar = isGuideView
		? request.tourist_avatar
		: request.guide_avatar;
	const detailUrl = isGuideView
		? `/guide/requests/${request.id}`
		: `/bookings/details/${request.id}`;

	return (
		<Link
			href={detailUrl}
			className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
			<Card className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
				<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
					<div className="flex items-center gap-3">
						<div className="relative h-12 w-12 overflow-hidden rounded-full border bg-muted">
							{participantAvatar ? (
								<Image
									src={participantAvatar}
									alt={participantName || "Member"}
									fill
									className="object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
									{(participantName || "U")[0]}
								</div>
							)}
						</div>

						<div className="space-y-1">
							<h3 className="text-base font-semibold text-foreground">
								{participantName || "Unknown member"}
							</h3>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Clock className="h-3.5 w-3.5" />
								{format(
									new Date(request.created_at),
									"MMM d, yyyy",
								)}
							</div>
						</div>
					</div>

					<RequestStatusBadge
						status={request.status}
						isGuideView={isGuideView}
					/>
				</div>

				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					<div>
						<p className="text-xs text-muted-foreground">
							Destination
						</p>
						<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
							<MapPin className="h-3.5 w-3.5" />{" "}
							{request.destinations || "Unspecified"}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">
							Group size
						</p>
						<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
							<Users className="h-3.5 w-3.5" />{" "}
							{request.people_count || 1}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">
							Duration
						</p>
						<p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
							<Calendar className="h-3.5 w-3.5" />{" "}
							{request.duration_days || 1} day(s)
						</p>
					</div>
				</div>
			</Card>
		</Link>
	);
}
