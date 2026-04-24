import { Metadata } from "next";
import { AdminDashboardPage } from "@/components/admin/admin-dashboard-page";

export const metadata: Metadata = {
	title: "Admin Dashboard | Unseen Nepal",
	description:
		"Core admin metrics for users, bookings, stories, and operational queues.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminDashboardPage />;
}
