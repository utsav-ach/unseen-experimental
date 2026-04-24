"use client";

import { Activity } from "@/backend/schemas";
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

interface AdminActivityTableProps {
	rows: Activity[];
	isLoading?: boolean;
	onEdit: (activity: Activity) => void;
	onDelete: (id: string) => Promise<void>;
}

export function AdminActivityTable({
	rows,
	isLoading = false,
	onEdit,
	onDelete,
}: AdminActivityTableProps) {
	if (!rows.length) {
		return (
			<Card className="border-border/70 bg-card/80">
				<CardContent className="py-10 text-center text-sm text-muted-foreground">
					No activities found for this view.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden border-border/70 bg-card/80">
			<div className="overflow-x-auto">
				<table className="w-full min-w-200 text-sm">
					<thead className="bg-muted/30">
						<tr className="border-b border-border/70 text-left">
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Name
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Category
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Difficulty
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Duration
							</th>
							<th className="px-4 py-3 font-medium text-muted-foreground">
								Image
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
								<td className="px-4 py-3">
									<Badge variant="outline">
										{row.display_category}
									</Badge>
								</td>
								<td className="px-4 py-3 text-foreground">
									{row.difficulty}
								</td>
								<td className="px-4 py-3 text-foreground">
									{row.duration_range}
								</td>
								<td className="px-4 py-3 text-foreground">
									{row.featured_image ? "Yes" : "No"}
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
														Delete activity?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This action removes the
														activity from public
														activity and package
														linking flows.
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
														Delete activity
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
