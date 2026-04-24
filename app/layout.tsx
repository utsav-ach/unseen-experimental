import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Unseen Nepal — Local guides for extraordinary journeys",
    template: "%s · Unseen Nepal",
  },
  description:
    "Discover Nepal with trusted local guides. Browse featured destinations, negotiate custom trips, or book curated packages for treks, culture, and adventure.",
  metadataBase: new URL("https://unseen.np"),
  openGraph: {
    type: "website",
    siteName: "Unseen Nepal",
    title: "Unseen Nepal — Local guides for extraordinary journeys",
    description:
      "Discover Nepal with trusted local guides. Treks, culture, adventure — crafted by people who grew up in these valleys.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
