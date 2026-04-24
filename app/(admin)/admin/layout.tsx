import { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
	title: "Admin Workspace | Unseen Nepal",
	description:
		"Operational admin panel for managing content, guides, bookings, and user roles.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AdminShell>{children}</AdminShell>;
}
