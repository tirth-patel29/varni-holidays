import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import { COMPANY_CONTACT, getTravelAgencyJsonLd } from "@/lib/config/contact";

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
  authors: [{ name: "Varni Holidays", url: "https://varni-holidays.vercel.app" }],
  openGraph: {
    title: "Varni Holidays — Your Gateway to Joyful Holidays",
    description: "Bespoke holiday curation, tour packages, flights and visa assistance from Anand, Gujarat.",
    url: "https://varni-holidays.vercel.app",
    siteName: COMPANY_CONTACT.businessName,
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getTravelAgencyJsonLd();

  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} overflow-x-hidden`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

