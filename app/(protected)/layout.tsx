import {
	AuthProfile,
	AuthProfileSchema,
} from "@/backend/v2/models/user-models";
import {
	NeedsEmailVerificationPage,
	NeedsLoginPage,
	NeedsOnboardingPage,
} from "../../components/auth/auth-state-pages";
import { callRpc, ssrClient } from "@/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home-page/Footer";
import { cn } from "@/lib/utils";

export default async function ProtectedRouteGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	let profileData: AuthProfile | null = null;

	try {
		const supabase = await ssrClient();
		profileData = await callRpc<AuthProfile>(
			supabase,
			"fetch_profile",
			AuthProfileSchema,
		);
	} catch {
		profileData = null;
	}

	if (!profileData?.profile) {
		return <NeedsLoginPage fallbackMessage="protected workspace" />;
	}

	if (!profileData.is_auth_verified) {
		return (
			<NeedsEmailVerificationPage fallbackMessage="protected workspace" />
		);
	}

	if (!profileData.is_onboarding_done) {
		return <NeedsOnboardingPage fallbackMessage="protected workspace" />;
	}

	return (
		<>
			<Navbar />
			<main className={cn("flex-1 transition-all duration-500 pt-20")}>
				<div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
					{children}
				</div>
			</main>

			<Footer />
		</>
	);
}
