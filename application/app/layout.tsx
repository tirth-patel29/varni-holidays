import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Varni Holidays — Your Gateway to Joyful Holidays | Luxury & Curated Travel",
  description:
    "Bespoke holiday curation, domestic and international tour packages, flight consultation and visa assistance crafted with genuine Gujarat hospitality from Anand.",
  keywords: [
    "Varni Holidays",
    "Anand Travel Agency",
    "Kerala Tour Packages",
    "Flight Enquiries",
    "Visa Assistance",
    "Gujarat Tour Operator",
  ],
  authors: [{ name: "Varni Holidays", url: "https://varnitours.com" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

