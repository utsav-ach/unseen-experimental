"use client";

import { Guard } from "@/components/auth/auth-initializer";

interface ProtectedRouteClientGuardProps {
	children?: React.ReactNode;
	fallbackMessage?: string;
}

export function ProtectedRouteClientGuard({
	children,
	fallbackMessage = "protected workspace",
}: ProtectedRouteClientGuardProps) {
	return <Guard fallbackMessage={fallbackMessage}>{children}</Guard>;
}
