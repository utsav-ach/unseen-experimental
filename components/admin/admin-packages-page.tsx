"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function AdminPackagesPage() {
	const { packages, isLoading, error, fetchPackages, deletePackage } =
		useAdminStore();

	useEffect(() => {
		void fetchPackages();
	}, [fetchPackages]);

	const onDelete = async (id: string) => {
		const ok = await deletePackage(id);
		if (ok) {
			toast.success("Package deleted.");
			return;
		}
		toast.error("Failed to delete package.");
	};

	return (
		<div>
			<AdminPageHeader
				title="Travel Packages"
				description="Manage direct-booking package blueprints and capacity details."
				action={
					<Button
						variant="outline"
						onClick={() => void fetchPackages()}
						disabled={isLoading}>
						Refresh
					</Button>
				}
			/>

			{error ? (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>Could not load packages</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="space-y-3">
				{packages.map((travelPackage) => (
					<Card key={travelPackage.id}>
						<CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{travelPackage.name}
								</p>
								<p className="text-xs text-muted-foreground">
									Rs. {travelPackage.discounted_price} •{" "}
									{travelPackage.total_days} days •{" "}
									{travelPackage.type === "activities_package"
										? "Activities package"
										: "Destination package"}
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => void onDelete(travelPackage.id)}
								disabled={isLoading}>
								Delete
							</Button>
						</CardContent>
					</Card>
				))}

				{!packages.length && !isLoading ? (
					<Card>
						<CardContent className="py-8 text-center text-sm text-muted-foreground">
							No packages found.
						</CardContent>
					</Card>
				) : null}
			</div>
		</div>
	);
}
