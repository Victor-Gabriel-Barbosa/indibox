import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components";
import "./globals.css";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-coverflow';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IndiBox",
  description: "IndiBox - Sua plataforma independente",
  icons: {
    icon: [
      { url: "/assets/favicon/favicon.ico", sizes: "any" },
      { url: "/assets/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: "/assets/favicon/apple-touch-icon.png",
  },
  manifest: "/assets/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
