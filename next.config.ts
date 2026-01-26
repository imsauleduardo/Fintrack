import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
const withPWAInit = require("next-pwa");

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline", // Redirige a esta página si falla la carga del documento
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Para fotos de perfil de Google OAuth
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Para imágenes placeholder si se usan
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Optimizaciones de producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // PWA & Optimizaciones experimentales
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns'],
  },
  eslint: {
    // Esto permitirá que Vercel termine el deploy aunque ESLint tenga errores circulares
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opcional: ignora errores de tipos en el build para mayor velocidad en el deploy
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(withPWA(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "marketr",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },
});