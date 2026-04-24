import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Booking Checkout | Unseen Nepal",
	description:
		"Complete the required prepayment and confirm your guide booking with clear payment and billing details.",
};

export default function CheckoutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
