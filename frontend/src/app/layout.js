import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteData } from "@/components/Seo";

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
  alternates: {
    canonical: siteData.url,
  },
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
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "120x120",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "512x512",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicons/favicon.ico",
    },
  ],
};














export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
