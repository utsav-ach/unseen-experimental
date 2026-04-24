import {
	Map,
	BookOpen,
	Image as ImageIcon,
	Footprints,
	User,
	Compass,
	Settings,
	LayoutDashboard,
	CalendarCheck,
	Navigation2,
	TrendingUp,
	Activity,
	LucideIcon,
} from "lucide-react";

export interface NavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
	isStandalone?: boolean;
	children?: {
		title: string;
		href: string;
		icon: LucideIcon;
		description?: string;
	}[];
}

export interface GuideMenuOptions {
	isGuide: boolean;
	isGuideApplicationPending: boolean;
}

export const navMenus: NavItem[] = [
	{
		title: "Explore",
		href: "/destinations",
		icon: Map,
		children: [
			{
				title: "Trending Destinations",
				href: "/destinations",
				icon: TrendingUp,
				description: "Discover top destinations.",
			},
			{
				title: "Selection Map",
				href: "/destinations/map",
				icon: Navigation2,
				description: "Select a destination to travel for.",
			},
		],
	},
	{
		title: "Photos",
		href: "/photos",
		icon: ImageIcon,
		isStandalone: true,
	},
	// {
	//     title: "Activities",
	//     href: "/activities",
	//     icon: Activity,
	//     isStandalone: true
	// },
	{
		title: "Stories",
		href: "/stories",
		icon: BookOpen,
		children: [
			{
				title: "See Stories",
				href: "/stories",
				icon: BookOpen,
				description: "Read stories from local legends.",
			},
			{
				title: "Photos",
				href: "/photos",
				icon: ImageIcon,
				description: "Visual of destinations.",
			},
		],
	},
	{
		title: "Trek Dai",
		href: "/trek-dai",
		icon: Footprints,
		children: [
			{
				title: "Find a Guide",
				href: "/trek-dai",
				icon: Footprints,
				description: "Hire a local guide for your trip.",
			},
			{
				title: "My Bookings",
				href: "/bookings",
				icon: CalendarCheck,
				description: "Track your active hired requests.",
			},
		],
	},
	{
		title: "My Bookings",
		href: "/bookings",
		icon: CalendarCheck,
		isStandalone: true,
	},
];

export const profileMenu = {
	title: "Account",
	icon: User,
	href: "/profile",
	children: [
		{
			title: "My Profile",
			href: "/profile",
			icon: User,
			description: "Manage your profile.",
		},
		{
			title: "Settings",
			href: "/profile/settings",
			icon: Settings,
			description: "Personalize your settings.",
		},
	],
};

export const guideMenu = {
	title: "Guide Dashboard",
	href: "/guide/requests",
	icon: Compass,
	children: [
		{
			title: "Guide Dashboard",
			href: "/guide/requests",
			icon: CalendarCheck,
			description: "Review your pending applications.",
		},
		{
			title: "Application Status",
			href: "/guide/register/status",
			icon: LayoutDashboard,
			description: "Check your guide verification status.",
		},
	],
};

export const getGuideMenu = ({
	isGuide,
	isGuideApplicationPending,
}: GuideMenuOptions): NavItem | null => {
	if (isGuide) {
		return {
			...guideMenu,
			children: [
				{
					title: "Guide Dashboard",
					href: "/guide/requests",
					icon: CalendarCheck,
					description: "Manage bookings and traveler requests.",
				},
			],
		};
	}

	if (isGuideApplicationPending) {
		return {
			title: "Guide Application",
			href: "/guide/register/status",
			icon: LayoutDashboard,
			children: [
				{
					title: "Application Status",
					href: "/guide/register/status",
					icon: LayoutDashboard,
					description: "Check your guide verification status.",
				},
			],
		};
	}

	return null;
};

export const adminMenu = {
	title: "System Admin",
	href: "/admin/dashboard",
	icon: Settings,
	children: [
		{
			title: "Dashboard",
			href: "/admin/dashboard",
			icon: LayoutDashboard,
			description: "Platform wide metrics.",
		},
		{
			title: "Guide Applications",
			href: "/admin/guides/applications",
			icon: Compass,
			description: "Approve or reject guide applications.",
		},
		{
			title: "Content",
			href: "/admin/destinations",
			icon: Activity,
			description: "Manage destinations, activities, and packages.",
		},
	],
};
