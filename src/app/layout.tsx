import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mild2wild.vercel.app"),
  title: {
    default: "Mild 2 Wild | Tattoos, Salon & Spa",
    template: "%s | Mild 2 Wild",
  },
  description:
    "A bright, bold booking site for tattoos, nails, hair, spa services, staff profiles, shop policies, and retail favorites.",
  applicationName: "Mild 2 Wild",
  keywords: ["tattoos", "nails", "hair salon", "spa", "aesthetics", "booking", "Mild 2 Wild"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
