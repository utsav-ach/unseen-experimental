import { Navbar } from "@/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Unseen Nepal | Onboarding",
	description:
		"Complete your profile setup to start exploring the authentic trails of Nepal.",
};

export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen flex flex-col">
			<Navbar hideLinks={true} />
			<main className="flex-1 mt-20">{children}</main>
		</div>
	);
}
