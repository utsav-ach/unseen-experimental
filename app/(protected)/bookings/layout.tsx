import { Metadata } from "next";

export const metadata: Metadata = {
	title: "My Bookings | Unseen Nepal",
	description:
		"Manage your travel requests, view guide responses, and finalize your next adventure in Nepal.",
};

export default function BookingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
