import type { Application } from 'express';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { env } from '@/config/index.js';

export function setupSentry(_app: Application) {
  if (!env.SENTRY_DSN || env.SENTRY_DSN.trim() === '') {
    console.warn(
      '[sentry] ❌ DSN AUSENTE. Verifique .env / carregamento de env.'
    );
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE ?? 0,
    profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE ?? 0,
    debug: false,
  });

  Sentry.setTag('boot', 'ok');
  Sentry.captureMessage('sentry: boot ok', 'info');
}

export function attachSentryErrorHandler(app: Application) {
  Sentry.setupExpressErrorHandler(app);
}

export function wireProcessHandlers() {
  process.on('unhandledRejection', (err) => Sentry.captureException(err));
  process.on('uncaughtException', (err) => {
    Sentry.captureException(err);
    throw err;
  });
}
