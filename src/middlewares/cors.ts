import cors from 'cors';

import { env } from '@/config/index.js';

const corsMiddleware = () => {
  return cors({
    origin: ['https://localhost:5174', env.CORS_ORIGIN],
  });
};

export default corsMiddleware;