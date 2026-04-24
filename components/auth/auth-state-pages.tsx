import Link from "next/link";
import { Lock, LogIn, MailWarning, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoBackButton } from "@/components/auth/go-back-button";

interface AuthStatePageProps {
	fallbackMessage?: string;
}

export function NeedsLoginPage({
	fallbackMessage = "this page",
}: AuthStatePageProps) {
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
					<Lock className="h-6 w-6 text-primary" />
				</div>
				<h2 className="text-xl font-semibold text-foreground">
					Sorry you are not logged in
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					You must be logged in to access the {fallbackMessage}.
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					You are not logged in please login to continue.
				</p>
				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button asChild className="rounded-lg">
						<Link href="/login">
							<LogIn className="mr-2 h-4 w-4" />
							Login
						</Link>
					</Button>
					<GoBackButton />
				</div>
			</div>
		</div>
	);
}

export function NeedsEmailVerificationPage({
	fallbackMessage = "this page",
}: AuthStatePageProps) {
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
					<MailWarning className="h-6 w-6 text-amber-500" />
				</div>
				<h2 className="text-xl font-semibold text-foreground">
					Sorry your account is not verified yet
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					You must first verify your email before accessing the{" "}
					{fallbackMessage}.
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					If you already clicked the link sent in email then refresh
					the page to continue.
				</p>
				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button asChild className="rounded-lg">
						<Link href="/auth/verify-email">
							<MailWarning className="mr-2 h-4 w-4" />
							Resend email
						</Link>
					</Button>
					<GoBackButton />
				</div>
			</div>
		</div>
	);
}

export function NeedsOnboardingPage({
	fallbackMessage = "this page",
}: AuthStatePageProps) {
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border bg-background">
					<UserCheck className="h-6 w-6 text-primary" />
				</div>
				<h2 className="text-xl font-semibold text-foreground">
					Sorry you havent provided your information
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					You must complete your profile setup before accessing the{" "}
					{fallbackMessage}.
				</p>
				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button asChild className="rounded-lg">
						<Link href="/onboarding">
							<UserCheck className="mr-2 h-4 w-4" />
							Setup profile
						</Link>
					</Button>
					<GoBackButton />
				</div>
			</div>
		</div>
	);
}
