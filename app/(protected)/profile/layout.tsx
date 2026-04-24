import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "My Profile | Unseen Nepal",
	description:
		"Manage your Unseen Nepal profile, bookings, booking requests, stories, photos, and guide status from one dashboard.",
};

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
