"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useAdminStore } from "@/backend/v2/stores/useAdminStore";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminUsersPage() {
	const { users, isLoading, error, fetchUsers, setUserAdminStatus } =
		useAdminStore();
	const [query, setQuery] = useState("");

	useEffect(() => {
		void fetchUsers(50, 0, null);
	}, [fetchUsers]);

	const onSearch = () => {
		void fetchUsers(50, 0, query.trim() ? query.trim() : null);
	};

	const onToggleAdmin = async (userId: string, current: boolean) => {
		const ok = await setUserAdminStatus(userId, !current);
		if (ok) {
			toast.success(!current ? "Admin granted." : "Admin revoked.");
			return;
		}
		toast.error("Failed to update admin flag.");
	};

	return (
		<div>
			<AdminPageHeader
				title="Users & Roles"
				description="Search users and manage admin access controls."
				action={
					<Button
						variant="outline"
						onClick={() => void fetchUsers()}
						disabled={isLoading}>
						Refresh
					</Button>
				}
			/>

			<div className="mb-4 flex gap-2">
				<Input
					value={query}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setQuery(event.target.value)
					}
					placeholder="Search by username or name"
				/>
				<Button onClick={onSearch} disabled={isLoading}>
					Search
				</Button>
			</div>

			{error ? (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>User list failed</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="space-y-3">
				{users.map((user) => (
					<Card key={user.id}>
						<CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{user.first_name || ""}{" "}
									{user.last_name || ""}{" "}
									{!user.first_name && !user.last_name
										? user.username
										: ""}
								</p>
								<p className="text-xs text-muted-foreground">
									@{user.username || "unknown"} •{" "}
									{user.is_guide ? "Guide" : "Traveler"}
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Button
									variant={
										user.is_admin
											? "destructive"
											: "outline"
									}
									onClick={() =>
										void onToggleAdmin(
											user.id,
											user.is_admin,
										)
									}>
									{user.is_admin
										? "Revoke Admin"
										: "Make Admin"}
								</Button>
							</div>
						</CardContent>
					</Card>
				))}

				{!users.length && !isLoading ? (
					<Card>
						<CardContent className="py-8 text-center text-sm text-muted-foreground">
							No users found.
						</CardContent>
					</Card>
				) : null}
			</div>
		</div>
	);
}
