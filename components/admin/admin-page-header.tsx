import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
	title: string;
	description: string;
	action?: ReactNode;
	className?: string;
}

export function AdminPageHeader({
	title,
	description,
	action,
	className,
}: AdminPageHeaderProps) {
	return (
		<header
			className={cn(
				"flex flex-col gap-4 rounded-lg border border-border/70 bg-card/60 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-5",
				className,
			)}>
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{description}
				</p>
			</div>
			{action ? <div>{action}</div> : null}
		</header>
	);
}
