import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Redirect | Unseen Nepal",
	description: "Redirecting to admin dashboard.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function AdminIndexPage() {
	redirect("/admin/dashboard");
}
