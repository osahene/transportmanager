import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SecureHeaders } from "./components/SecureHeaders";
import OfflineBanner from "./components/offlineBanner";
import { Providers } from "./providers";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YOS Car Rentals - Transport Manager",
  description: "Comprehensive transport management system",
  manifest: "/manifest.webmanifest",  
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YOS Cars",
  },
  formatDetection: {
    telephone: false,
  }, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <SecureHeaders />
      </head>
      <body className={`${inter.className} antialiased`}>
        <OfflineBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: "#1e40af",
};