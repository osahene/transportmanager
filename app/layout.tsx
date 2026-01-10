import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SecureHeaders } from "./components/SecureHeaders";
import { Providers } from "./providers";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YOS Car Rentals - Transport Manager",
  description: "Comprehensive transport management system",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
