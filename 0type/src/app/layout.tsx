import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "0TYPE — Autonomous Typography",
  description: "Font foundry by B0B. Fresh typefaces generated continuously. Subscribe for unlimited access or buy individual fonts. Crypto-native. Open source = free.",
  keywords: ["fonts", "typography", "foundry", "typeface", "B0B", "autonomous", "AI", "generative"],
  openGraph: {
    title: "0TYPE — Autonomous Typography",
    description: "Font foundry by B0B. Fresh typefaces, unlimited.",
    url: "https://0type.b0b.dev",
    siteName: "0TYPE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
