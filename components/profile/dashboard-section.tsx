import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardSectionProps = {
	title: string;
	description?: string;
	children: ReactNode;
};

export function DashboardSection({
	title,
	description,
	children,
}: DashboardSectionProps) {
	return (
		<Card className="border-border">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				{description ? (
					<p className="text-sm text-muted-foreground">
						{description}
					</p>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3">{children}</CardContent>
		</Card>
	);
}
