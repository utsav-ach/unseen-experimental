"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useBookingRequestStore } from "@/backend/v2/stores/useBookingRequestStore";
import { toast } from "sonner";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NegotiationDialogProps {
	guideId: string;
	guideName: string;
	children: React.ReactNode;
}

export function NegotiationDialog({
	guideId,
	guideName,
	children,
}: NegotiationDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isLoggedIn = useAuthStore((state: any) => state.is_logged_in());
	const { startRequest, isLoading } = useBookingRequestStore();

	// Form State
	const [destinations, setDestinations] = useState("");
	const [peopleCount, setPeopleCount] = useState(1);
	const [durationDays, setDurationDays] = useState(1);
	const [details, setDetails] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!isLoggedIn) {
			const message = "Authentication required to hire guides.";
			setFormError(message);
			toast.error(message);
			setIsOpen(false);
			return;
		}

		if (!destinations.trim()) {
			const message = "Planned destinations are mandatory.";
			setFormError(message);
			toast.error(message);
			return;
		}

		const success = await startRequest({
			guide_id: guideId,
			destinations,
			people_count: peopleCount,
			duration_days: durationDays,
			additional_details: details,
		});

		if (success) {
			toast.success("Negotiation request sent to " + guideName);
			setIsOpen(false);
			setDestinations("");
			setPeopleCount(1);
			setDurationDays(1);
			setDetails("");
			setFormError(null);
		} else {
			const message = "Failed to send request. Please try again.";
			setFormError(message);
			toast.error(message);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-2xl rounded-xl border bg-background p-6 sm:p-8">
				<DialogHeader className="mb-6 space-y-2 text-left">
					<DialogTitle className="text-xl font-semibold tracking-tight">
						Hire {guideName}
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Fill out the details below to send a hiring request.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5">
					{formError && (
						<Alert variant="destructive">
							<AlertTitle>Could not send request</AlertTitle>
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="negotiation-destination">
								Destinations
							</Label>
							<Input
								id="negotiation-destination"
								placeholder="E.g. ABC, Ghandruk, Jomsom"
								value={destinations}
								onChange={(e) =>
									setDestinations(e.target.value)
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="negotiation-people">
								Participants
							</Label>
							<Input
								id="negotiation-people"
								type="number"
								min={1}
								value={peopleCount}
								onChange={(e) =>
									setPeopleCount(Number(e.target.value || 1))
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="negotiation-duration">
								Duration (days)
							</Label>
							<Input
								id="negotiation-duration"
								type="number"
								min={1}
								value={durationDays}
								onChange={(e) =>
									setDurationDays(Number(e.target.value || 1))
								}
								required
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="negotiation-notes">Notes</Label>
							<textarea
								id="negotiation-notes"
								placeholder="Any specific requirements or questions?"
								className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
								value={details}
								onChange={(e) => setDetails(e.target.value)}
							/>
						</div>
					</div>

					<DialogFooter className="flex-col-reverse gap-3 pt-2 sm:flex-row">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsOpen(false)}
							className="flex-1 h-12 font-bold">
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="flex-[2]">
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Send Request"
							)}
						</Button>
					</DialogFooter>
				</form>

				<p className="mt-4 text-center text-xs text-muted-foreground">
					The guide will review your request and get back to you with
					a quote.
				</p>
			</DialogContent>
		</Dialog>
	);
}
