import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
	status: string;
	isGuideView?: boolean;
	className?: string;
}

export function RequestStatusBadge({
	status,
	isGuideView = false,
	className,
}: StatusBadgeProps) {
	const getStatusDetails = (status: string) => {
		switch (status) {
			case "pending":
				return {
					label: isGuideView
						? "Respond with terms"
						: "Waiting for guide to send terms",
					styles: "border",
				};
			case "approved":
				return {
					label: isGuideView
						? "Waiting for tourist for checkout"
						: "Payment Awaiting - Finalize",
					styles: "border bg-primary/10 text-primary",
				};
			case "rejected":
				return {
					label: isGuideView ? "You Rejected" : "Guide Rejected",
					styles: "border bg-destructive/10 text-destructive",
				};
			case "confirmed":
				return {
					label: "Confirmed",
					styles: "border bg-primary/10 text-primary",
				};
			case "cancelled":
				return {
					label: isGuideView ? "Tourist Cancelled" : "You Cancelled",
					styles: "border bg-muted text-muted-foreground",
				};
			default:
				return {
					label: status,
					styles: "border bg-muted text-muted-foreground",
				};
		}
	};

	const { label, styles } = getStatusDetails(status);

	return (
		<Badge
			variant="secondary"
			className={cn(
				"rounded-md border px-2.5 py-1 text-[10px] uppercase tracking-tight",
				styles,
				className,
			)}>
			{label}
		</Badge>
	);
}
