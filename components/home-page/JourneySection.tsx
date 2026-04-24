"use client";

import {
	motion,
	useScroll,
	useTransform,
	useMotionValueEvent,
	MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
	Building2,
	Mountain,
	Castle,
	MountainSnow,
	Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const journeyStops = [
	{
		id: 1,
		name: "Kathmandu",
		title: "Your Journey Begins",
		description:
			"Start your adventure in the vibrant capital, where ancient temples meet modern energy.",
		icon: Building2,
		image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
		color: "#C9A96E",
	},
	{
		id: 2,
		name: "Pokhara",
		title: "Lake Paradise",
		description:
			"Discover serene lakes surrounded by the majestic Annapurna range.",
		icon: Mountain,
		image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
		color: "#C4704A",
	},
	{
		id: 3,
		name: "Mustang",
		title: "Hidden Kingdom",
		description:
			"Explore the ancient walled city and dramatic desert landscapes.",
		icon: Castle,
		image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
		color: "#6B8C6B",
	},
	{
		id: 4,
		name: "Dolpo",
		title: "Remote Wilderness",
		description:
			"Experience untouched beauty in one of Nepal's most isolated regions.",
		icon: MountainSnow,
		image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop",
		color: "#8C8480",
	},
];

export default function JourneySection() {
	const containerRef = useRef(null);
	const [activeDestination, setActiveDestination] = useState<string | null>(
		null,
	);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	// Path progress for the SVG line
	const pathLength = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

	useMotionValueEvent(scrollYProgress, "change", (latest) => {
		if (latest < 0.2) setActiveDestination(null);
		else if (latest >= 0.2 && latest < 0.4)
			setActiveDestination("kathmandu");
		else if (latest >= 0.4 && latest < 0.6) setActiveDestination("pokhara");
		else if (latest >= 0.6 && latest < 0.8) setActiveDestination("mustang");
		else if (latest >= 0.8) setActiveDestination("dolpo");
	});

	return (
		<section
			ref={containerRef}
			className="relative py-40 px-4 bg-background overflow-hidden"
			suppressHydrationWarning>
			{/* Wave Divider */}
			<div className="absolute top-0 left-0 w-full overflow-hidden leading-none opacity-50">
				<svg
					className="relative block w-full h-20"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1200 120"
					preserveAspectRatio="none">
					<path
						d="M0,0 C250,70 450,70 600,40 C750,10 950,10 1200,40 L1200,0 L0,0 Z"
						className="fill-muted/20"></path>
				</svg>
			</div>

			<div className="max-w-7xl mx-auto relative z-10">
				<div className="text-center mb-20">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						className="inline-flex items-center gap-3 text-primary text-[11px] font-bold tracking-[2.5px] uppercase mb-4 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
						<Sparkles className="w-3.5 h-3.5" />
						Our Signature Trail
					</motion.div>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-5xl md:text-7xl font-display font-black text-foreground mb-4 tracking-tight">
						Your Nepal Journey
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
						Follow the path less traveled through the heart of the
						Himalayas.
					</motion.p>
				</div>

				<div className="relative">
					{/* SVG Progress Path (Desktop Only) */}
					<svg
						className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block"
						viewBox="0 0 1000 800"
						preserveAspectRatio="xMidYMid meet">
						<defs>
							<linearGradient
								id="journeyGradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%">
								<stop offset="0%" stopColor="#C9A96E" />
								<stop offset="33%" stopColor="#C4704A" />
								<stop offset="66%" stopColor="#6B8C6B" />
								<stop offset="100%" stopColor="#8C8480" />
							</linearGradient>
						</defs>
						<motion.path
							d="M 100,200 Q 300,100 500,200 T 900,200"
							stroke="currentColor"
							strokeWidth="2"
							fill="none"
							strokeDasharray="8,8"
							className="text-border/30"
						/>
						<motion.path
							d="M 100,200 Q 300,100 500,200 T 900,200"
							stroke="url(#journeyGradient)"
							strokeWidth="4"
							fill="none"
							strokeLinecap="round"
							style={{ pathLength }}
						/>
					</svg>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
						{journeyStops.map((jStop, index) => (
							<JourneyStopItem
								key={jStop.id}
								jStop={jStop}
								index={index}
								scrollYProgress={scrollYProgress}
								isActive={
									activeDestination ===
									jStop.name.toLowerCase()
								}
							/>
						))}
					</div>
				</div>

				{/* Bottom CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mt-24">
					<p className="text-muted-foreground mb-8 text-lg font-medium">
						Ready to start your own adventure?
					</p>
					<button className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95">
						Consult with Trek Dai
					</button>
				</motion.div>
			</div>
		</section>
	);
}

interface JourneyStopProps {
	jStop: (typeof journeyStops)[0];
	index: number;
	scrollYProgress: MotionValue<number>;
	isActive: boolean;
}

function JourneyStopItem({
	jStop,
	index,
	scrollYProgress,
	isActive,
}: JourneyStopProps) {
	const router = useRouter();
	const startProgress = 0.1 + index * 0.2;
	const endProgress = startProgress + 0.15;

	const opacity = useTransform(
		scrollYProgress,
		[startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
		[0, 1, 1, 0.7],
	);

	const scale = useTransform(
		scrollYProgress,
		[startProgress - 0.1, startProgress, endProgress],
		[0.8, 1.05, 1],
	);

	const scaleX = useTransform(
		scrollYProgress,
		[startProgress, endProgress],
		[0, 1],
	);

	const dotScale = useTransform(
		scrollYProgress,
		[startProgress - 0.05, startProgress],
		[0, 1],
	);

	const IconComponent = jStop.icon;

	return (
		<motion.div
			style={{ opacity, scale }}
			className="relative cursor-pointer"
			onClick={() =>
				router.push(`/destinations/${jStop.name.toLowerCase()}`)
			}>
			<Card
				className={`overflow-hidden group hover:shadow-2xl transition-all duration-500 border-border/50 bg-card rounded-[2rem] ${
					isActive
						? "ring-4 ring-primary/30 border-primary scale-105 shadow-2xl shadow-primary/10"
						: ""
				}`}>
				<div className="relative h-56 overflow-hidden">
					<Image
						src={jStop.image}
						alt={jStop.name}
						fill
						className="object-cover group-hover:scale-110 transition-transform duration-700"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

					{/* Icon Badge */}
					<div className="absolute top-4 right-4 w-14 h-14 bg-card/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
						<IconComponent
							className="w-7 h-7"
							style={{ color: jStop.color }}
						/>
					</div>

					{/* Step Number Badge */}
					<div className="absolute bottom-4 left-4">
						<div
							className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl"
							style={{ backgroundColor: jStop.color }}>
							{index + 1}
						</div>
					</div>
				</div>

				<CardContent className="p-8">
					<h3 className="text-2xl font-display font-black text-foreground mb-2 group-hover:text-primary transition-colors tracking-tight">
						{jStop.name}
					</h3>
					<h4 className="text-sm font-bold text-primary/80 uppercase tracking-widest mb-3">
						{jStop.title}
					</h4>
					<p className="text-muted-foreground leading-relaxed text-sm font-medium opacity-80">
						{jStop.description}
					</p>
				</CardContent>

				{/* Progress Indicator at bottom of card */}
				<motion.div
					className="h-1.5"
					style={{
						backgroundColor: jStop.color,
						scaleX,
						originX: 0,
					}}
				/>
			</Card>

			{/* Connecting Dot for the SVG Line (Desktop) */}
			<motion.div
				className="hidden md:block absolute -top-32 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-background shadow-xl z-20"
				style={{
					backgroundColor: jStop.color,
					scale: dotScale,
				}}
			/>
		</motion.div>
	);
}
