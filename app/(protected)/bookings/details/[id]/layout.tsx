import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Booking Request Details | Unseen Nepal",
	description:
		"Review guide pricing, remarks, and negotiation status before you confirm or cancel your booking request.",
};

export default function BookingDetailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
