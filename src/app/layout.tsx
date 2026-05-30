import type { Metadata } from "next";
import { Bangers, Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import { buildLocalBusinessJsonLd, buildWebsiteJsonLd, businessName, siteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bangers({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
});

const localBusinessJsonLd = buildLocalBusinessJsonLd();
const websiteJsonLd = buildWebsiteJsonLd();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${businessName} | Tattoos, Nails, Hair & Spa`,
    template: "%s | Mild 2 Wild",
  },
  description:
    "Request tattoos, custom nails, hair color, salon services, aesthetics, spa care, and aftercare favorites from Mild 2 Wild's colorful studio website.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  applicationName: "Mild 2 Wild",
  keywords: ["tattoos", "tattoo parlor", "custom nails", "nail art", "hair salon", "spa", "aesthetics", "booking", "Mild 2 Wild"],
  authors: [{ name: "Mild 2 Wild" }],
  creator: "Mild 2 Wild",
  publisher: "Mild 2 Wild",
  openGraph: {
    type: "website",
    siteName: "Mild 2 Wild",
    title: "Mild 2 Wild | Tattoos, Salon & Spa",
    description:
      "Explore tattoos, nails, hair, spa services, staff meet-me pages, policies, products, and appointment requests.",
    url: "/",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Mild 2 Wild bright neon salon and tattoo website preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mild 2 Wild | Tattoos, Salon & Spa",
    description:
      "Explore tattoos, nails, hair, spa services, staff meet-me pages, policies, products, and appointment requests.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${marker.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f6f0e4] text-black">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessJsonLd, websiteJsonLd]) }}
        />
        {children}
      </body>
    </html>
  );
}
