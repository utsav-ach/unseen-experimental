"use client";

import { ReactNode, useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/backend/v2/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface ImmersiveHeaderProps {
	badge: string;
	title: ReactNode;
	description: string;
	heroImage?: string;
	children: ReactNode; // The search/filter card content
}

export function ImmersiveHeader({
	badge,
	title,
	description,
	heroImage,
	children,
}: ImmersiveHeaderProps) {
	const { is_logged_in } = useAuthStore();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	// On server and first client render, assume logged out to match SSR
	const isUserLoggedIn = mounted ? is_logged_in() : false;

	// Logged out / Hero Style
	if (!isUserLoggedIn && heroImage) {
		return (
			<section className="relative h-[70vh] flex items-center justify-center overflow-hidden mb-20">
				<Image
					src={heroImage}
					alt="Hero"
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
				<div className="relative z-10 text-center max-w-5xl px-6">
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6 }}>
						<Badge className="mb-6 bg-white/10 text-white backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] font-bold">
							{badge}
						</Badge>
						<h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 uppercase tracking-tight leading-tight">
							{title}
						</h1>
						<p className="text-lg md:text-xl text-white/90 font-medium mb-12 max-w-2xl mx-auto leading-relaxed border-l-2 border-primary pl-6 py-1 bg-black/5 backdrop-blur-sm rounded-r-xl">
							{description}
						</p>
						<div className="w-full max-w-3xl mx-auto">
							<Card className="p-4 md:p-6 rounded-[2rem] shadow-2xl border-white/10 glass-card bg-white/5 backdrop-blur-2xl">
								{children}
							</Card>
						</div>
					</motion.div>
				</div>
			</section>
		);
	}

	// Logged In / Modern Clean Style
	return (
		<section className="relative pt-24 pb-12 overflow-hidden border-b bg-card/5">
			<div className="absolute top-[-100px] left-1/4 w-[600px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none" />

			<div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10 relative">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full">
					<Badge className="mb-4 bg-primary/5 text-primary border-primary/10 py-1 px-3 rounded-full text-[9px] font-bold uppercase tracking-widest">
						{badge}
					</Badge>
					<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
						<div className="max-w-2xl">
							<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight leading-none">
								{title}
							</h1>
							<p className="text-lg text-muted-foreground leading-relaxed font-medium">
								{description}
							</p>
						</div>
					</div>
				</motion.div>

				{/* Interactive Controls Overlay */}
				<Card className="p-4 md:p-6 rounded-[2rem] shadow-xl border-primary/5 glass-card relative z-30">
					{children}
				</Card>
			</div>
		</section>
	);
}
