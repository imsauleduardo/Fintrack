import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import FcmHandler from "@/components/FcmHandler";

// Configuración de tipografía Inter según PRD
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fintrack - Tu Seguimiento Financiero",
  description: "Una aplicación integral para el seguimiento de tus finanzas personales.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Fintrack - Tu Seguimiento Financiero",
    description: "Una aplicación integral para el seguimiento de tus finanzas personales.",
    url: "https://fintrack.vercel.app", // O tu URL real
    siteName: "Fintrack",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fintrack Dashboard",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fintrack - Tu Seguimiento Financiero",
    description: "Una aplicación integral para el seguimiento de tus finanzas personales.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fintrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff", // Modo claro default
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Previene zoom accidental en inputs en iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning // <--- ESTA ES LA CORRECCIÓN
      >
        <FcmHandler />
        {children}
        <Analytics />
      </body>
    </html>
  );
}