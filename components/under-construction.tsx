"use client";

import { motion } from "framer-motion";
import { Hammer, ArrowLeft, Cog, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnderConstructionProps {
	title?: string;
	description?: string;
	showBackButton?: boolean;
}

export function UnderConstruction({
	title = "Adventure Under Construction",
	description = "We're currently scouting this region to bring you the best hidden side of Nepal. Check back soon for exclusive stories, guides, and photos!",
	showBackButton = true,
}: UnderConstructionProps) {
	return (
		<div className="min-h-[80vh] flex items-center justify-center px-6 py-20 relative overflow-hidden">
			{/* Background Decor */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

			<div className="max-w-2xl w-full text-center relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="inline-flex items-center justify-center p-6 rounded-3xl bg-background/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl mb-12 group">
					<div className="relative">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{
								repeat: Infinity,
								duration: 4,
								ease: "easeInOut",
							}}>
							<Hammer className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
						</motion.div>
						<motion.div
							className="absolute -top-2 -right-2"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.5, 1, 0.5],
							}}
							transition={{ repeat: Infinity, duration: 2 }}>
							<Sparkles className="w-6 h-6 text-gold fill-gold" />
						</motion.div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}>
					<h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-6 tracking-tighter">
						{title}
					</h1>
					<p className="text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed">
						{description}
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4">
					{showBackButton && (
						<Link href="/">
							<Button
								size="lg"
								variant="outline"
								className="rounded-full px-8 gap-2 group hover:gap-4 transition-all bg-background/50 backdrop-blur-sm">
								<ArrowLeft className="w-4 h-4" />
								Return Home
							</Button>
						</Link>
					)}
					<Button
						size="lg"
						className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
						<Cog className="w-4 h-4 animate-spin-slow" />
						Get Notified
					</Button>
				</motion.div>

				{/* Animated Elements */}
				<div className="absolute -top-20 -left-10 opacity-20 hidden md:block pointer-events-none">
					<Cog className="w-40 h-40 text-primary/20 animate-spin-slow" />
				</div>
				<div className="absolute -bottom-20 -right-10 opacity-20 hidden md:block pointer-events-none">
					<Cog className="w-60 h-60 text-gold/20 animate-spin-slow-reverse" />
				</div>
			</div>
		</div>
	);
}
