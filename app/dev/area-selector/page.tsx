"use client";

import { useState } from "react";
import { SelectionMap, SelectionPin } from "@/components/map/selection-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AreaSelectorDemo() {
	const [selectedPins, setSelectedPins] = useState<SelectionPin[]>([]);

	return (
		<main className="min-h-screen bg-background pt-32 pb-20 px-6 md:px-12">
			<div className="max-w-7xl mx-auto space-y-12">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
					<div className="max-w-2xl space-y-4">
						<Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest">
							Technical Demonstration
						</Badge>
						<h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
							Area{" "}
							<span className="text-muted-foreground">
								Selector
							</span>{" "}
							Engine
						</h1>
						<p className="text-xl text-muted-foreground leading-relaxed">
							A high-fidelity geospatial tool for defining
							operating zones. Drop markers, adjust radius
							protocol, and synchronize target locations with your
							mission profile.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
					{/* Map Interface */}
					<div className="lg:col-span-8">
						<SelectionMap
							onPinsChange={(pins) => setSelectedPins(pins)}
							className="shadow-3xl border-primary/20"
						/>
					</div>

					{/* Data Output / Stats */}
					<div className="lg:col-span-4 space-y-8">
						<section className="bg-card border rounded-[2.5rem] p-8 shadow-xl space-y-8">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
									<Target className="h-5 w-5 text-primary" />
								</div>
								<h2 className="text-xl font-bold">
									Selection Payload
								</h2>
							</div>

							<p className="text-sm text-muted-foreground leading-relaxed">
								Real-time coordinates and radius metadata being
								synchronized from the geospatial engine.
							</p>

							<div className="space-y-4">
								{selectedPins.length === 0 ? (
									<div className="p-8 border-2 border-dashed rounded-3xl text-center space-y-3 opacity-40">
										<MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
										<p className="text-xs font-bold uppercase tracking-widest">
											No Targets Identified
										</p>
									</div>
								) : (
									selectedPins.map((pin, i) => (
										<motion.div
											key={pin.id}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: i * 0.1 }}
											className="bg-muted/50 p-4 rounded-2xl border border-border flex items-center gap-4">
											<Badge className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center p-0 shrink-0">
												{i + 1}
											</Badge>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-bold truncate">
													{pin.address?.split(
														",",
													)[0] || "Target Zone"}
												</p>
												<p className="text-[10px] font-medium text-muted-foreground">
													Radius:{" "}
													{(
														pin.radius / 1000
													).toFixed(1)}{" "}
													KM
												</p>
											</div>
											<ShieldCheck className="h-4 w-4 text-primary shrink-0" />
										</motion.div>
									))
								)}
							</div>

							{selectedPins.length > 0 && (
								<div className="pt-8 border-t border-primary/5">
									<div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 group cursor-pointer overflow-hidden relative">
										<div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500" />
										<span className="font-bold text-sm relative z-10">
											CONFIRM OPERATING ZONES
										</span>
										<ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
									</div>
								</div>
							)}
						</section>

						<section className="p-8 bg-muted/20 border border-dashed rounded-[2.5rem] opacity-60">
							<h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">
								Internal Logic
							</h3>
							<ul className="text-[10px] font-bold space-y-3 text-muted-foreground">
								<li className="flex items-center gap-2">
									• PERSISTENT COORDINATE CACHING
								</li>
								<li className="flex items-center gap-2">
									• AUTOMATED REVERSE GEOCODING
								</li>
								<li className="flex items-center gap-2">
									• MULTI-TARGET BUFFER OVERLAY
								</li>
								<li className="flex items-center gap-2">
									• HIGH-PRECISION RADIUS SCALING
								</li>
							</ul>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}
