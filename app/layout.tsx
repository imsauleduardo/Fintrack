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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fintrack",
  },
  icons: {
    apple: "/icons/icon-192x192.png", // Asegúrate de tener estos iconos o usa una ruta válida
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
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <FcmHandler />
        {children}
        <Analytics />
      </body>
    </html>
  );
}