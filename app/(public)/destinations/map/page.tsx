"use client";

import React, { useState } from "react";
import { SelectionMap, SelectionPin } from "@/components/map/selection-map";
import { ImmersiveHeader } from "@/components/shared/immersive-header";
import { Guard } from "@/components/auth/auth-initializer";
import { motion } from "framer-motion";
import {
	MapPin,
	Navigation2,
	Search,
	Compass,
	Info,
	ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SelectionMapPage() {
	const [selectedZones, setSelectedZones] = useState<SelectionPin[]>([]);

	return (
		<div className="min-h-screen bg-[#FDFCF9] pb-32">
			<ImmersiveHeader
				badge="Geospatial Discovery"
				title={
					<>
						Strategic{" "}
						<span className="text-emerald-500 italic">
							Route Mapping
						</span>
					</>
				}
				description="Identify your area of interest on the interactive map. We'll connect you with certified guides who specialize in these specific terrain markers."
				heroImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
						<Navigation2 className="h-4 w-4 text-emerald-600" />
						<span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
							Active Radar
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl opacity-60">
						<MapPin className="h-4 w-4 text-slate-500" />
						<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
							Global Search
						</span>
					</div>
				</div>
			</ImmersiveHeader>

			<div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
					{/* Left Side: Map Interface */}
					<div className="lg:col-span-8 space-y-8">
						<div className="p-2 rounded-[2.5rem] bg-white shadow-2xl shadow-emerald-500/5 border border-slate-100 overflow-hidden">
							<SelectionMap
								onPinsChange={setSelectedZones}
								className="h-[600px] rounded-[2rem]"
							/>
						</div>

						<div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100/50 flex items-start gap-4">
							<div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
								<Info className="h-5 w-5" />
							</div>
							<div className="space-y-1">
								<h4 className="text-sm font-bold text-emerald-950 uppercase tracking-tight">
									How it works
								</h4>
								<p className="text-xs text-emerald-700/70 font-medium leading-relaxed">
									Click anywhere on the map to define a search
									zone. You can adjust the radius of each
									target area individually. Once defined, use
									the discovery dashboard to find guides whose
									service areas intersect with your chosen
									coordinates.
								</p>
							</div>
						</div>
					</div>

					{/* Right Side: Discovery Controls */}
					<div className="lg:col-span-4 space-y-8 sticky top-32">
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
							<div className="space-y-2">
								<div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
									Target Queue
								</div>
								<h3 className="text-2xl font-black tracking-tight text-slate-800 leading-none">
									Defined{" "}
									<span className="text-emerald-500 italic">
										Expeditions
									</span>
								</h3>
							</div>

							{selectedZones.length === 0 ? (
								<div className="py-12 text-center space-y-4">
									<div className="h-20 w-20 rounded-full bg-slate-50 border border-dashed border-slate-200 mx-auto flex items-center justify-center text-slate-300">
										<Search className="h-8 w-8" />
									</div>
									<p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
										No areas selected.
										<br />
										Identify territory on map.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{selectedZones.map((zone, i) => (
										<div
											key={zone.id}
											className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group">
											<div className="flex items-center gap-4">
												<div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 font-black text-xs shadow-sm">
													{i + 1}
												</div>
												<div>
													<p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1">
														Area Details
													</p>
													<p className="text-xs font-black text-slate-800 truncate max-w-[150px]">
														{zone.address?.split(
															",",
														)[0] || "Custom Target"}
													</p>
												</div>
											</div>
											<div className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full italic">
												{(zone.radius / 1000).toFixed(
													1,
												)}
												KM
											</div>
										</div>
									))}

									<div className="pt-6">
										<Button
											asChild
											className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold transition-all group">
											<Link href="/trek-dai">
												Discover Guides in Area
												<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
											</Link>
										</Button>
									</div>
								</div>
							)}
						</motion.div>

						<div className="p-8 rounded-[2rem] border border-slate-200/50 bg-slate-50/50 space-y-4">
							<Compass className="h-6 w-6 text-slate-300" />
							<p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group flex items-center gap-2">
								Professional GPS Precision{" "}
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
