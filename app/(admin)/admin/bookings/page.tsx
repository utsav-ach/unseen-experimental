import { Metadata } from "next";
import { AdminBookingsPage } from "@/components/admin/admin-bookings-page";

export const metadata: Metadata = {
	title: "Bookings Admin | Unseen Nepal",
	description: "Track negotiations and finalized bookings.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminBookingsPage />;
}
