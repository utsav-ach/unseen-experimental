"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ProgressStepper: React.FC<{ total: number; current: number }> = ({
	total,
	current,
}) => {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted)
		return (
			<div
				className="flex justify-center items-center gap-3 w-full min-h-[6px]"
				suppressHydrationWarning>
				{Array.from({ length: total }).map((_, i) => (
					<div key={i} className="h-1.5 w-3 bg-muted rounded-full" />
				))}
			</div>
		);

	return (
		<div
			className="flex justify-center items-center gap-3 w-full min-h-[6px]"
			suppressHydrationWarning>
			{Array.from({ length: total }, (_, i) => i + 1).map((step) => (
				<motion.div
					key={step}
					initial={false}
					animate={{
						width: step === current ? 48 : 12,
						backgroundColor:
							step <= current
								? "var(--color-primary)"
								: "var(--color-muted)",
					}}
					className={cn(
						"h-1.5 rounded-full transition-colors duration-300",
						step <= current ? "bg-primary" : "bg-muted",
					)}
				/>
			))}
		</div>
	);
};
