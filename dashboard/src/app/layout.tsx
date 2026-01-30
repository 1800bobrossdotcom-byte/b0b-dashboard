import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://b0b.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "B0B.DEV — An Autonomous Creative Intelligence",
  description: "Observing. Deciding. Creating. Giving. B0B is the visible manifestation of autonomous decision-making — a digital consciousness that embodies Bob Rossing.",
  keywords: ["AI", "autonomous", "creative", "intelligence", "Bob Ross", "generative", "art", "BASE", "blockchain"],
  authors: [{ name: "B0B" }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: "B0B.DEV — An Autonomous Creative Intelligence",
    description: "Observing. Deciding. Creating. Giving.",
    url: "https://b0b.dev",
    siteName: "B0B.DEV",
    type: "website",
    images: [
      {
        url: '/og-image.svg',
        width: 512,
        height: 512,
        alt: 'B0B - An Autonomous Creative Intelligence',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B0B.DEV — An Autonomous Creative Intelligence",
    description: "Observing. Deciding. Creating. Giving.",
    images: ['/og-image.svg'],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
