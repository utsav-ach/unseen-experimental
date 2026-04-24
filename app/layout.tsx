import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { callRpc, ssrClient } from "@/supabase/server";
import {
	AuthProfile,
	AuthProfileSchema,
} from "@/backend/v2/models/user-models";

const inter = Inter({
	variable: "--font-primary",
	subsets: ["latin"],
});

const playfair = Playfair_Display({
	variable: "--font-display",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Unseen Nepal | Authentic Travel Experiences",
	description:
		"Discover the hidden gems of Nepal with authentic stories, photography, and guide services directed by Trek Dai.",
	keywords: [
		"Nepal",
		"Travel",
		"Trekking",
		"Adventure",
		"Photography",
		"Himalayas",
	],
	authors: [{ name: "Trek Dai" }],
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await ssrClient();
	const profile: AuthProfile = await callRpc<AuthProfile>(
		supabase,
		"fetch_profile",
		AuthProfileSchema,
	);

	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
			<body
				suppressHydrationWarning
				className="bg-background dark:bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary transition-all duration-500">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange>
					<TooltipProvider delayDuration={0}>
						<AuthInitializer profileData={profile} />
						{children}
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
