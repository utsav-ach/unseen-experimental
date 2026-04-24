"use client";

import { LeafletMap } from "@/components/map/leaflet-map";
import { SearchBar } from "@/components/ui/search-bar";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
	Map as MapIcon,
	Search as SearchIcon,
	Terminal,
	Code2,
	Layers,
	Zap,
	Mountain,
	MapPin,
	CheckCircle2,
} from "lucide-react";

export default function DevPage() {
	const [lastLocation, setLastLocation] = useState<any>(null);
	const [isSearching, setIsSearching] = useState(false);

	const handleLocationChange = (
		lat: number,
		lng: number,
		address: string,
	) => {
		setLastLocation({ lat, lng, address });
	};

	const handleDemoSearch = (val: string) => {
		setIsSearching(true);
		setTimeout(() => setIsSearching(false), 2000);
	};

	return (
		<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 px-6 py-12 space-y-12 animate-in fade-in duration-700">
			<div className="max-w-6xl mx-auto space-y-4">
				<div className="flex items-center gap-3">
					<div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
						<Zap className="h-6 w-6 text-white" />
					</div>
					<div>
						<h1 className="text-4xl font-display font-black text-primary-dark dark:text-primary-light">
							Component Developer Lab
						</h1>
						<p className="text-muted-foreground font-medium">
							Experimenting with our premium UI components layer.
						</p>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Left Column: Search Bar Demo */}
				<div className="lg:col-span-4 space-y-6">
					<Card className="glass-card border-primary/10 overflow-hidden group">
						<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
						<CardHeader>
							<div className="flex items-center gap-2 mb-2">
								<SearchIcon className="h-4 w-4 text-primary" />
								<Badge
									variant="outline"
									className="border-primary/20 text-primary-dark">
									Modular Component
								</Badge>
							</div>
							<CardTitle>SearchBar UI</CardTitle>
							<CardDescription>
								Our premium search input with real-time feedback
								and clear actions.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<label className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground">
									Default State
								</label>
								<SearchBar
									placeholder="Type something..."
									onSearch={handleDemoSearch}
									isLoading={isSearching}
								/>
							</div>

							<div className="space-y-4 pt-4 border-t border-primary/5">
								<div className="flex items-center gap-2 text-xs font-bold text-foreground">
									<Terminal className="h-3.5 w-3.5 text-primary" />
									Props Documentation
								</div>
								<ul className="space-y-2 text-xs text-muted-foreground font-medium">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-3 w-3 text-primary" />
										<code className="bg-primary/5 px-1 rounded text-primary">
											onSearch
										</code>{" "}
										- closure for query
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-3 w-3 text-primary" />
										<code className="bg-primary/5 px-1 rounded text-primary">
											isLoading
										</code>{" "}
										- spinning indicator
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="h-3 w-3 text-primary" />
										<code className="bg-primary/5 px-1 rounded text-primary">
											onClear
										</code>{" "}
										- reset callback
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Callback Output Display */}
					<Card className="bg-slate-900 border-primary/20 text-white shadow-2xl animate-in slide-in-from-left-4 duration-1000">
						<CardHeader className="pb-2 border-b border-white/5">
							<CardTitle className="text-sm flex items-center gap-2">
								<Code2 className="h-4 w-4 text-primary" />
								Callback Stream
							</CardTitle>
						</CardHeader>
						<CardContent className="py-4">
							{lastLocation ? (
								<div className="space-y-3">
									<div className="flex flex-col gap-1">
										<span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">
											Readable Name
										</span>
										<p className="text-xs font-bold text-slate-300 truncate">
											{lastLocation.address}
										</p>
									</div>
									<div className="flex gap-4">
										<div className="flex flex-col gap-1 flex-1">
											<span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">
												Latitude
											</span>
											<p className="text-sm font-mono font-bold text-white">
												{lastLocation.lat.toFixed(6)}
											</p>
										</div>
										<div className="flex flex-col gap-1 flex-1">
											<span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">
												Longitude
											</span>
											<p className="text-sm font-mono font-bold text-white">
												{lastLocation.lng.toFixed(6)}
											</p>
										</div>
									</div>
								</div>
							) : (
								<p className="text-xs text-slate-500 italic font-medium">
									Waiting for map interaction...
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Leaflet Map Demo */}
				<div className="lg:col-span-8">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<MapIcon className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-bold tracking-tight">
								Leaflet Explorer
							</h2>
						</div>
						<div className="flex gap-2">
							<Badge className="bg-primary/10 text-primary border-0">
								Nominatim Geo
							</Badge>
							<Badge className="bg-primary/10 text-primary border-0">
								Callback Logic
							</Badge>
						</div>
					</div>

					<LeafletMap
						onLocationChange={handleLocationChange}
						className="h-[600px] border-primary/20 shadow-2xl shadow-primary/10 bg-slate-100 dark:bg-slate-900"
					/>

					<div className="mt-6 flex flex-wrap gap-4 items-center">
						<div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
							<Layers className="h-4 w-4" />
							Map Layer:
						</div>
						<div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm">
							OpenStreetMap Original
						</div>
						<div className="flex-1" />
						<div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
							<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
							Live Navigation Engine
						</div>
					</div>
				</div>
			</div>

			{/* Decorative Brand Elements */}
			<div className="fixed bottom-0 right-0 p-12 opacity-5 pointer-events-none -z-10 rotate-12">
				<Mountain className="h-96 w-96 text-primary" />
			</div>
		</div>
	);
}
