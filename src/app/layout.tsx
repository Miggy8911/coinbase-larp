import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Phantom-style LARP wallet simulator",
  description:
    "Entertainment-only wallet UI. Custom balances, simulated swaps, no keys, no chain.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LarpSim",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icon-180.png",
    icon: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1c1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
