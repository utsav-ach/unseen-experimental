import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy: High-Performance Edge Runtime Middleware.
 * Replaces the deprecated middleware.ts convention.
 * Optimized for minimal latency and maximum throughput.
 */
export async function proxy(request: NextRequest) {
	// 1. Initial response object
	let supabaseResponse = NextResponse.next({ request });

	// 2. Performance: Pre-calculate path-based flags to minimize expensive ops
	const { pathname } = request.nextUrl;

	// Quick exit for public assets (redundant but safe if config.matcher changes)
	if (pathname.includes(".") || pathname.startsWith("/_next"))
		return supabaseResponse;

	// Is this a route that REQUIRES any form of auth state?
	// We only perform the expensive getUser() if we are on a protected path
	// OR if we need to refresh the session for state consistency.
	const isDashboardPath =
		pathname.startsWith("/dashboard") ||
		pathname.startsWith("/profile") ||
		pathname.startsWith("/onboarding");
	const isAuthPath =
		pathname.startsWith("/login") || pathname.startsWith("/signup");

	// 3. Initialize Supabase SSR Client
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_BACKEND_URL!,
		process.env.NEXT_PUBLIC_BACKEND_PASSWORD!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					// Regenerate response to include new cookies
					supabaseResponse = NextResponse.next({ request });
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// 4. Single Unified Auth Call
	// Performance Note: We MUST call getUser() to refresh the session, but we do it exactly ONCE.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// 5. Edge-based Redirects (the "Fast Guard")
	// Note: Deeper checks (verification, onboarding) are delegated to the frontend <Guard> component
	// for superior UX (no layout reset) and performance (no extra DB lookups in the proxy).

	// A. Unauthenticated user trying to access protected areas
	if (!user && isDashboardPath) {
		const redirectUrl = new URL("/login", request.url);
		// Preserve current path for post-login redirect
		redirectUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// B. Authenticated user trying to access login/signup
	if (user && isAuthPath) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return supabaseResponse;
}

/**
 * Proxy Configuration
 * Carefully scoped to prevent middleware overhead on static content.
 */
export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * - api/auth (handled by auth service)
		 * - _next (Next.js internals)
		 * - Static assets (images, icons, etc.)
		 */
		"/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
