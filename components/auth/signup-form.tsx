"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const signUp = useAuthStore((state: any) => state.signUp);
	const loginWithGoogle = useAuthStore((state: any) => state.loginWithGoogle);
	const isLoading = useAuthStore((state: any) => state.isLoading);
	const error = useAuthStore((state: any) => state.error);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError(null);

		if (password !== confirmPassword) {
			setLocalError("Passwords do not match");
			return;
		}

		const success = await signUp(email, password);
		if (success) {
			// Redirect to verification page after signup to show the 'Check your email' message
			router.push("/auth/verify-email");
		}
	};

	const handleLoginWithGoogle = async () => {
		await loginWithGoogle();
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={handleSubmit}>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Create an account</h1>
					<p className="text-sm text-balance text-muted-foreground">
						Enter your email below to create your account
					</p>
				</div>

				{(error || localError) && (
					<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
						{error || localError}
					</div>
				)}

				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="bg-background"
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="bg-background"
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="confirm-password">
						Confirm Password
					</FieldLabel>
					<Input
						id="confirm-password"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						className="bg-background"
					/>
				</Field>

				<Field>
					<Button
						type="submit"
						disabled={isLoading}
						className="w-full">
						{isLoading ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							"Sign Up"
						)}
					</Button>
				</Field>
				<FieldSeparator>Or continue with</FieldSeparator>
				<Field>
					<Button
						variant="outline"
						type="button"
						className="w-full"
						disabled={isLoading}
						onClick={() => loginWithGoogle()}>
						{/* Simple Google Icon SVG placeholder */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 48 48"
							className="mr-2 h-4 w-4">
							<path
								fill="#FFC107"
								d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
							/>
							<path
								fill="#FF3D00"
								d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
							/>
							<path
								fill="#4CAF50"
								d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
							/>
							<path
								fill="#1976D2"
								d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
							/>
						</svg>
						Sign up with Google
					</Button>
					<FieldDescription className="text-center mt-4">
						Already have an account?{" "}
						<Link
							href="/login"
							className="underline underline-offset-4">
							Login
						</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
