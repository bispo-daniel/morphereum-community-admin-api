import { Router } from 'express';

import auth from '@/controllers/auth/index.js';

const router = Router();

router.post('/', auth);

export { router as authRoutes };
