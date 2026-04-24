import { SignupForm } from "@/components/auth/signup-form";
import { Compass } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link
						href="/"
						className="flex items-center gap-2 font-medium">
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Compass className="size-4" />
						</div>
						Unseen Nepal
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<SignupForm />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop"
					alt="Nepal landscape"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] grayscale-[0.2]"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-12">
					<div className="space-y-2">
						<h3 className="text-3xl font-display font-black text-white">
							Join the Community
						</h3>
						<p className="text-lg text-white/80 font-medium">
							Capture the beauty, share the stories, and explore
							the unseen corners of Nepal.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
