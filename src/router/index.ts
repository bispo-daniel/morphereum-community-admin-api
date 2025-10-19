import { Router } from 'express';

import authMiddleware from '@/middlewares/auth.js';

import { artsRoutes } from './arts.js';
import { authRoutes } from './auth.js';
import { linksRoutes } from './links.js';
import { raidsRoutes } from './raids.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/raids', authMiddleware, raidsRoutes);
router.use('/links', authMiddleware, linksRoutes);
router.use('/arts', authMiddleware, artsRoutes);
