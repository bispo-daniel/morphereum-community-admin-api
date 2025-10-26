import '@sentry/node';
import http from 'http';
import https from 'https';
import express from 'express';

import '@/utils/log.js';
import { cert } from '@/config/cert.js';
import { env } from '@/config/index.js';
import { router } from '@/router/index.js';
import { connectToMongoDb } from '@/utils/connectToMongoDb.js';
import { startCacheInvalidationConsumer } from '@/messaging/cacheInvalidationConsumer.js';
import {
  cors,
  docs,
  jsonParser,
  logger,
  rateLimiter,
  speedLimiter,
} from '@/middlewares/index.js';
import {
  setupSentry,
  attachSentryErrorHandler,
  wireProcessHandlers,
} from '@/observability/sentry.js';
import { getEndOfDayTTL } from '@/utils/getEndOfDayTTL.js';

const isHttps = env.NODE_ENV === 'development';

const app = express();
const server = isHttps
  ? https.createServer({ ...cert }, app)
  : http.createServer(app);

setupSentry(app);
wireProcessHandlers();

app.use(logger());
app.use(cors());
app.use(speedLimiter());
app.use(rateLimiter());
app.use(jsonParser());
app.use(docs());
app.use('/api', router);
attachSentryErrorHandler(app);

connectToMongoDb();

startCacheInvalidationConsumer().catch((e) => {
  console.warn('[rabbitmq] --> consumer failed to start', e);
});

const endOfDayTTL = getEndOfDayTTL();
const hours = Math.floor(endOfDayTTL / 3600);
const minutes = Math.floor((endOfDayTTL % 3600) / 60);
const formattedTTL = `${hours} hours and ${minutes} minutes`;

server.listen(env.PORT, () => {
  console.log(
    `[server] --> Running at ${isHttps ? 'https' : 'http'}://localhost:${env.PORT}`
  );
  console.log(`[cache] --> End of the day's TTL is set to ${formattedTTL}`);
});
