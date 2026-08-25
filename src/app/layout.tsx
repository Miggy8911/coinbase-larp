import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Coinbase LARP simulator",
  description: "Unofficial Coinbase-style LARP app. Fake account and trades. Live prices. No real money.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Coinbase",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icon-180.png",
    icon: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0052FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
