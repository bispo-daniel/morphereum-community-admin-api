import { Router } from 'express';

import {
  createLink,
  getLinks,
  removeLink,
  updateLink,
} from '@/controllers/links/index.js';

const router = Router();

router.get('/', getLinks);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/:id', removeLink);

export { router as linksRoutes };
