"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useBookingRequestStore } from "@/backend/v2/stores/useBookingRequestStore";
import { Guard } from "@/components/auth/auth-initializer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	CreditCard,
	Lock,
	Calendar,
	MapPin,
	Users,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePackageStore } from "@/backend/v2/stores/usePackageStore";

export default function CheckoutPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const searchParams = useSearchParams();
	const bookingType =
		searchParams.get("type") === "package" ? "package" : "guide";

	const {
		fetchRequestDetailForTourist,
		currentRequest: request,
		isLoading,
		finalizeRequest,
		temporaryRemarks,
		createPackageBooking,
	} = useBookingRequestStore();

	const {
		currentPackage,
		fetchPackageDetails,
		isLoading: isPackageLoading,
	} = usePackageStore();

	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [isAgreed, setIsAgreed] = useState(false);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");

	useEffect(() => {
		if (bookingType === "guide" && id && !request) {
			fetchRequestDetailForTourist(id);
		}
	}, [bookingType, id, request, fetchRequestDetailForTourist]);

	useEffect(() => {
		if (bookingType === "package" && id) {
			fetchPackageDetails(id);
		}
	}, [bookingType, id, fetchPackageDetails]);

	const handleConfirmBooking = async () => {
		if (!isAgreed) {
			toast.error("Please agree to the terms and conditions.");
			return;
		}
		setIsProcessing(true);

		if (bookingType === "package") {
			const finalAmount = Number(
				currentPackage?.package?.discounted_price ?? 0,
			);
			const success = await createPackageBooking({
				package_id: id,
				payment_provider: paymentMethod as
					| "cash"
					| "card"
					| "esewa"
					| "khalti"
					| "stripe"
					| "paypal",
				paid_amount: finalAmount,
				participant_count: 1,
			});

			if (success) {
				toast.success("Package booked successfully.");
				router.push("/bookings");
			} else {
				toast.error("Failed to complete package booking.");
			}
		} else {
			const prepayAmount = Number(request?.prepay_amount || 0);
			const success = await finalizeRequest(id, "confirmed", {
				remarks: temporaryRemarks,
				payment_provider: paymentMethod as
					| "cash"
					| "card"
					| "esewa"
					| "khalti"
					| "stripe"
					| "paypal",
				paid_amount: prepayAmount,
			});

			if (success) {
				toast.success("Booking confirmed.", {
					description:
						"Your prepayment is recorded and the guide is notified.",
				});
				router.push("/bookings");
			} else {
				toast.error("Failed to finalize booking.");
			}
		}
		setIsProcessing(false);
	};

	if (
		(bookingType === "guide" && isLoading && !request) ||
		(bookingType === "package" && isPackageLoading && !currentPackage)
	) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (bookingType === "guide" && !request) return null;
	if (bookingType === "package" && !currentPackage) return null;

	const prepayAmount =
		bookingType === "guide"
			? Number(request?.prepay_amount || 0)
			: Number(currentPackage?.package?.discounted_price || 0);
	const totalAmount = prepayAmount;

	const guide = request?.guide as any;
	const packageSummary = currentPackage?.package;

	return (
		<Guard fallbackMessage="checkout page">
			<main className="min-h-screen bg-background pt-24 pb-16">
				<section className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
					<div className="lg:col-span-8 space-y-6">
						<div className="flex items-center justify-between">
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="w-fit">
								<Link
									href={
										bookingType === "guide"
											? `/bookings/details/${id}`
											: `/packages/details/${id}`
									}
									className="inline-flex items-center gap-2">
									<ArrowLeft className="h-4 w-4" />
									{bookingType === "guide"
										? "Back to details"
										: "Back to package details"}
								</Link>
							</Button>
						</div>

						<header className="space-y-2">
							<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
								Complete{" "}
								{bookingType === "guide"
									? "booking"
									: "package booking"}
							</h1>
							<p className="text-sm text-muted-foreground">
								{bookingType === "guide"
									? "Make the required prepayment to confirm your guide booking."
									: "Complete payment to confirm your package booking."}
							</p>
						</header>

						<Card className="rounded-xl border bg-card p-5">
							<h2 className="text-sm font-semibold text-foreground">
								Payment method
							</h2>
							<RadioGroup
								value={paymentMethod}
								onValueChange={setPaymentMethod}
								className="mt-4 grid gap-3 sm:grid-cols-2">
								<Label
									htmlFor="pay-card"
									className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
									<RadioGroupItem
										id="pay-card"
										value="card"
									/>
									<CreditCard className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Card</span>
								</Label>

								<Label
									htmlFor="pay-esewa"
									className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
									<RadioGroupItem
										id="pay-esewa"
										value="esewa"
									/>
									<span className="text-sm">eSewa</span>
								</Label>

								<Label
									htmlFor="pay-khalti"
									className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
									<RadioGroupItem
										id="pay-khalti"
										value="khalti"
									/>
									<span className="text-sm">Khalti</span>
								</Label>

								<Label
									htmlFor="pay-cash"
									className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
									<RadioGroupItem
										id="pay-cash"
										value="cash"
									/>
									<Lock className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Cash</span>
								</Label>
							</RadioGroup>

							{paymentMethod === "cash" && (
								<Alert className="mt-4">
									<AlertTitle>
										Cash payment selected
									</AlertTitle>
									<AlertDescription>
										Confirm cash terms with your guide
										before the trip starts.
									</AlertDescription>
								</Alert>
							)}
						</Card>

						<Card className="rounded-xl border bg-card p-5">
							<h2 className="text-sm font-semibold text-foreground">
								Billing details
							</h2>
							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								<div className="space-y-2 sm:col-span-2">
									<Label htmlFor="billing-full-name">
										Full name
									</Label>
									<Input
										id="billing-full-name"
										value={fullName}
										onChange={(e) =>
											setFullName(e.target.value)
										}
										placeholder="Your full name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="billing-email">Email</Label>
									<Input
										id="billing-email"
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										placeholder="you@example.com"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="billing-phone">Phone</Label>
									<Input
										id="billing-phone"
										value={phone}
										onChange={(e) =>
											setPhone(e.target.value)
										}
										placeholder="+977 98XXXXXXXX"
									/>
								</div>
							</div>
						</Card>

						<Card className="rounded-xl border bg-card p-5">
							<div className="flex items-start gap-3">
								<input
									id="terms"
									checked={isAgreed}
									onChange={(e) =>
										setIsAgreed(e.target.checked)
									}
									type="checkbox"
									className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
								/>
								<Label
									htmlFor="terms"
									className="text-sm font-normal text-muted-foreground">
									I agree to the payment and cancellation
									terms for this booking.
								</Label>
							</div>

							<div className="mt-4 grid gap-3 sm:grid-cols-2">
								<Button asChild variant="outline">
									<Link href={`/bookings/details/${id}`}>
										Cancel
									</Link>
								</Button>
								<Button
									onClick={handleConfirmBooking}
									disabled={isProcessing}>
									{isProcessing ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<>Pay ${totalAmount.toLocaleString()}</>
									)}
								</Button>
							</div>
						</Card>
					</div>

					<aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
						<Card className="rounded-xl border bg-card p-5">
							<h2 className="text-sm font-semibold text-foreground">
								Booking summary
							</h2>

							{bookingType === "guide" ? (
								<div className="mt-4 flex items-center gap-3">
									<div className="relative h-11 w-11 overflow-hidden rounded-full border bg-muted">
										{guide?.avatar_url ? (
											<Image
												src={guide.avatar_url}
												alt={
													guide?.full_name || "Guide"
												}
												fill
												className="object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-xs font-semibold text-primary">
												{(guide?.full_name || "G")[0]}
											</div>
										)}
									</div>
									<div>
										<p className="text-xs text-muted-foreground">
											Guide
										</p>
										<p className="text-sm font-medium text-foreground">
											{guide?.full_name ||
												"Professional guide"}
										</p>
									</div>
								</div>
							) : (
								<div className="mt-4">
									<p className="text-xs text-muted-foreground">
										Package
									</p>
									<p className="text-sm font-medium text-foreground">
										{packageSummary?.name ||
											"Selected package"}
									</p>
								</div>
							)}

							<Separator className="my-4" />

							<dl className="space-y-3 text-sm">
								<div>
									<dt className="text-muted-foreground">
										Destination
									</dt>
									<dd className="mt-1 inline-flex items-center gap-1 text-foreground">
										<MapPin className="h-3.5 w-3.5" />
										{bookingType === "guide"
											? request?.destinations ||
												"Unspecified"
											: packageSummary?.name ||
												"Package route"}
									</dd>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<dt className="text-muted-foreground">
											Duration
										</dt>
										<dd className="mt-1 inline-flex items-center gap-1 text-foreground">
											<Calendar className="h-3.5 w-3.5" />
											{bookingType === "guide"
												? `${request?.duration_days || 1} day(s)`
												: `${packageSummary?.total_days || 1} day(s)`}
										</dd>
									</div>
									<div>
										<dt className="text-muted-foreground">
											People
										</dt>
										<dd className="mt-1 inline-flex items-center gap-1 text-foreground">
											<Users className="h-3.5 w-3.5" />
											{bookingType === "guide"
												? request?.people_count || 1
												: 1}
										</dd>
									</div>
								</div>
							</dl>

							<Separator className="my-4" />

							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Prepayment
									</span>
									<span className="text-foreground">
										${prepayAmount.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Service fee
									</span>
									<span className="text-foreground">$0</span>
								</div>
								<div className="flex items-center justify-between border-t pt-2 font-medium text-foreground">
									<span>Total to pay</span>
									<span>${totalAmount.toLocaleString()}</span>
								</div>
							</div>
						</Card>
					</aside>
				</section>
			</main>
		</Guard>
	);
}
