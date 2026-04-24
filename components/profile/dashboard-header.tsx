import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "@/backend/schemas";

function getDisplayName(profile?: Partial<Profile> | null) {
	if (!profile) return "Traveler";
	const fullName = [
		profile.first_name,
		profile.middle_name,
		profile.last_name,
	]
		.filter(Boolean)
		.join(" ")
		.trim();

	return fullName || profile.username || "Traveler";
}

export function DashboardHeader({
	profile,
}: {
	profile?: Partial<Profile> | null;
}) {
	const name = getDisplayName(profile);
	const initial = name.charAt(0)?.toUpperCase() || "T";

	return (
		<Card className="border-border">
			<CardContent className="p-4 md:p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-4">
						<Avatar className="h-14 w-14 rounded-lg">
							<AvatarImage
								src={profile?.avatar_url || ""}
								alt={name}
							/>
							<AvatarFallback className="rounded-lg">
								{initial}
							</AvatarFallback>
						</Avatar>

						<div className="space-y-1">
							<h1 className="text-xl font-semibold text-foreground">
								{name}
							</h1>
							<p className="text-sm text-muted-foreground">
								@{profile?.username || "traveler"}
							</p>
							<div className="flex flex-wrap items-center gap-2 pt-1">
								{profile?.is_guide && (
									<Badge variant="outline">Guide</Badge>
								)}
								{profile?.is_admin && (
									<Badge variant="outline">Admin</Badge>
								)}
							</div>
						</div>
					</div>

					<Button asChild variant="outline">
						<Link href="/profile/edit">Edit profile</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
