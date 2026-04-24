import { Metadata } from "next";
import { AdminDestinationsPage } from "@/components/admin/admin-destinations-page";

export const metadata: Metadata = {
	title: "Destinations Admin | Unseen Nepal",
	description:
		"Manage featured destinations used by discovery and booking flow.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <AdminDestinationsPage />;
}
