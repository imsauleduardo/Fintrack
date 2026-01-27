// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://00969047c74d2dbc129e5ed5dd5f9d89@o4510760817065984.ingest.us.sentry.io/4510760826175488",

  // Solo rastrear el 10% en lugar del 100% para evitar saturar el hilo principal
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  enableLogs: false,
  sendDefaultPii: false,
});
