import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	// Legacy shim stores are loose-typed during the v1 -> v2 migration. Re-enable
	// strict checks once all consumer pages are refactored to call v2 services
	// directly and the shims in backend/v2/stores/use*Store.ts are deleted.
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "gwhfdibumtvrritxpoxp.supabase.co",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "gwhfdibumtvrritxpoxp.supabase.co",
				pathname: "/storage/v1/object/public/stories_images/**",
			},
			{
				protocol: "https",
				hostname: "ui-avatars.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
		],
	},
	allowedDevOrigins: ["*"],
	// enablePrerenderSourceMaps: true,
	productionBrowserSourceMaps: true,
	experimental: {
		serverSourceMaps: true,
	},
};

export default nextConfig;
