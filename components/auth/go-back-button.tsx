"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoBackButton() {
	const router = useRouter();

	return (
		<Button
			variant="outline"
			onClick={() => router.back()}
			className="rounded-lg">
			<ArrowLeft className="mr-2 h-4 w-4" />
			Go back
		</Button>
	);
}
