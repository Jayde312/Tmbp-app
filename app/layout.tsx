import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thesmartmoneyblueprint.vip"),
  title: "TheSmartMoneyBlueprint | Invest, Save, and Retire",
  description:
    "Personalized retirement planning and strategic investment guidance. Build lasting wealth through our proven framework.",
  keywords: [
    "TheSmartMoneyBlueprint",
    "retirement planning",
    "investment guidance",
    "wealth building",
    "financial planning",
    "smart money",
  ],
  authors: [{ name: "TheSmartMoneyBlueprint" }],
  openGraph: {
    title: "TheSmartMoneyBlueprint | Invest, Save, and Retire",
    description:
      "Personalized retirement planning and strategic investment guidance. Build lasting wealth through our proven framework.",
    url: "https://www.thesmartmoneyblueprint.vip",
    siteName: "TheSmartMoneyBlueprint",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TheSmartMoneyBlueprint Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheSmartMoneyBlueprint | Invest, Save, and Retire",
    description:
      "Personalized retirement planning and strategic investment guidance. Build lasting wealth through our proven framework.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0c1622",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0c1622] overflow-x-hidden">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#0c1622] text-gray-100 min-h-screen m-0 p-0 overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
