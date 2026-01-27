// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://00969047c74d2dbc129e5ed5dd5f9d89@o4510760817065984.ingest.us.sentry.io/4510760826175488",

  // Solo rastrear el 10% en lugar del 100% para evitar saturar el hilo principal
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  enableLogs: false,
  sendDefaultPii: false,
});