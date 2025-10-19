import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';

import cors from 'cors';
import express from 'express';
import {
  type Options as RateLimitOptions,
  rateLimit,
} from 'express-rate-limit';
import { type Options as SlowDownOptions, slowDown } from 'express-slow-down';
import morgan from 'morgan';

import '@/utils/log.js';
import { cert } from '@/config/cert.js';
import { env } from '@/config/index.js';
import { router } from '@/router/index.js';
import { connectToMongoDb } from '@/utils/connectToMongoDb.js';

import { getEndOfDayTTL } from './utils/getEndOfDayTTL.js';

const isHttps = env.NODE_ENV === 'development';

// Exemplo de funcionamento do rate-limit e slow-down:
// 1° minuto: O slow-down permite 45 requisições.
// 2° minuto: O slow-down permite mais 45 requisições (total de 90).
// 3° minuto: O rate-limit permite mais 10 requisições, completando o limite de 100 a cada 10 minutos.
// A partir daí até o final do 10° minuto, o rate-limit impede que mais requisições sejam feitas até o período de 10 minutos se renovar.

// Aplica atraso progressivo após 30 requisições dentro de 1 minuto.
const speedLimiter: Partial<SlowDownOptions> = {
  windowMs: 1 * 60 * 1000,
  delayAfter: 30,
  delayMs: (hits) => hits * 500,
  validate: { trustProxy: false },
};

// Limita cada IP a 100 requisições por 10 minutos.
const limiter: Partial<RateLimitOptions> = {
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
};

morgan.token('timestamp', () => {
  const date = new Date();
  return date.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  });
});

morgan.token('statusColor', (_req: IncomingMessage, res: ServerResponse) => {
  const status = res.headersSent ? res.statusCode : undefined;

  const color =
    status !== undefined
      ? status >= 500
        ? 31 // red
        : status >= 400
          ? 33 // yellow
          : status >= 300
            ? 36 // cyan
            : status >= 200
              ? 32 // green
              : 0 // no color
      : 0;

  return `\x1b[${color}m${status}\x1b[0m`;
});

const morganFormat =
  ':timestamp - :method :url :statusColor :response-time ms - :res[content-length]';

const app = express();
const server = isHttps
  ? https.createServer({ ...cert }, app)
  : http.createServer(app);

app.use(morgan(morganFormat));
app.use(slowDown(speedLimiter));
app.use(rateLimit(limiter));
app.use(
  cors({
    origin: ['https://localhost:5174', env.CORS_ORIGIN],
  })
);
app.use(express.json());
app.use('/api', router);

connectToMongoDb();

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
