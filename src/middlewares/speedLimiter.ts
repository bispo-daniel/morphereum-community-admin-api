import { type Options as SlowDownOptions, slowDown } from 'express-slow-down';

const speedLimiter = () => {
  // Aplica atraso progressivo após 150 requisições dentro de 1 minuto.
  const speedLimiter: Partial<SlowDownOptions> = {
    windowMs: 1 * 60 * 1000,
    delayAfter: 150,
    delayMs: (hits) => hits * 500,
    validate: { trustProxy: false },
  };

  return slowDown(speedLimiter);
};

export default speedLimiter;
