import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteData } from "@/components/Seo";
import GoogleAnalytics from "@/components/GoogleAnalytics"; // or { GoogleAnalytics } depending on export

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: siteData.title,
  creator: siteData.creator,
  description: siteData.description,
  keywords: siteData.keywords.join(", "),
  metadataBase: new URL(siteData.url),
  alternates: { canonical: siteData.url },
  openGraph: {
    title: siteData.title,
    description: siteData.description,
    url: siteData.url,
    siteName: siteData.title,
    images: siteData.image,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteData.title,
    description: siteData.description,
    images: siteData.image,
    site: siteData.url,
    creator: siteData.creator,
  },
  icons: [{ rel: "icon", url: "/favicons/favicon.ico" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics gaId="G-PLCYD52C3E" />
        {children}
      </body>
    </html>
  );
}

