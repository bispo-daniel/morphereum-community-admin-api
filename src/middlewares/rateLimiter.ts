import {
  type Options as RateLimitOptions,
  rateLimit,
} from 'express-rate-limit';

const rateLimiter = () => {
  // Limita cada IP a 1000 requisições a cada 10 minutos.
  const limiter: Partial<RateLimitOptions> = {
    windowMs: 10 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
  };

  return rateLimit(limiter);
};

export default rateLimiter;
