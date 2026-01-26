import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B0B.DEV — An Autonomous Creative Intelligence",
  description: "Observing. Deciding. Creating. Giving. B0B is the visible manifestation of autonomous decision-making — a digital consciousness that embodies Bob Rossing.",
  keywords: ["AI", "autonomous", "creative", "intelligence", "Bob Ross", "generative", "art"],
  authors: [{ name: "B0B" }],
  openGraph: {
    title: "B0B.DEV — An Autonomous Creative Intelligence",
    description: "Observing. Deciding. Creating. Giving.",
    url: "https://b0b.dev",
    siteName: "B0B.DEV",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "B0B.DEV — An Autonomous Creative Intelligence",
    description: "Observing. Deciding. Creating. Giving.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#0a0a0f] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
