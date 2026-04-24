"use client";

import { FeaturedDestination } from "@/backend/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

interface AdminDestinationTableProps {
	rows: FeaturedDestination[];
	isLoading?: boolean;
	onEdit: (destination: FeaturedDestination) => void;
	onDelete: (id: string) => Promise<void>;
}

export function AdminDestinationTable({
	rows,
	isLoading = false,
	onEdit,
	onDelete,
}: AdminDestinationTableProps) {
	if (!rows.length) {
		return (
			<Card className="border-border/70 bg-card/80">
				<CardContent className="py-10 text-center text-sm text-muted-foreground">
					No destinations found for this view.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden border-border/70 bg-card/80">
			<div className="overflow-x-auto">
				<table className="w-full min-w-215 text-sm">
					<thead className="bg-muted/30">
						<tr className="border-b border-border/70 text-left">
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Name
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Radius
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Rating
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Tags
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Images
							</th>
							<th className="px-4 py-3 text-right font-medium text-muted-foreground">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr
								key={row.id}
								className="border-b border-border/60 align-top hover:bg-muted/20">
								<td className="px-4 py-3">
									<p className="font-medium text-foreground">
										{row.name}
									</p>
									{row.description ? (
										<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
											{row.description}
										</p>
									) : null}
								</td>
								<td className="px-4 py-3 text-foreground">
									{row.radius} km
								</td>
								<td className="px-4 py-3 text-foreground">
									{row.avg_rating ?? "N/A"}
								</td>
								<td className="px-4 py-3">
									<div className="flex max-w-72 flex-wrap gap-1">
										{(row.tags ?? []).length ? (
											row.tags.map((tag) => (
												<Badge
													key={`${row.id}-${tag}`}
													variant="outline">
													{tag}
												</Badge>
											))
										) : (
											<span className="text-xs text-muted-foreground">
												No tags
											</span>
										)}
									</div>
								</td>
								<td className="px-4 py-3 text-foreground">
									{(row.additional_images ?? []).length +
										(row.feature_image ? 1 : 0)}
								</td>
								<td className="px-4 py-3">
									<div className="flex justify-end gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => onEdit(row)}
											disabled={isLoading}>
											<Pencil className="mr-1 h-3.5 w-3.5" />{" "}
											Edit
										</Button>

										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													size="sm"
													variant="destructive"
													disabled={isLoading}>
													<Trash2 className="mr-1 h-3.5 w-3.5" />{" "}
													Delete
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Delete destination?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This removes the
														destination from all
														public surfaces. This
														action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														variant="destructive"
														onClick={() =>
															void onDelete(
																row.id,
															)
														}>
														Delete destination
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
