import { type Request, type Response } from 'express';

import { artsCache } from '@/controllers/arts/getArts.js';
import { ArtsSchema } from '@/models/arts/index.js';
import * as s from '@/services/arts/updateArt.js';
import {
  endResponseWithCode,
  internalServerError,
  notFound,
} from '@/utils/http.js';
import logError from '@/utils/logError.js';

const bodySchema = ArtsSchema.element.pick({ approved: true });

const updateArt = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = bodySchema.safeParse(req.body);

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'updateArt',
      error: 'ID is required and must be a string',
    });

    return endResponseWithCode(res, 400);
  }

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'updateArt',
      error: result.error.format(),
    });

    return endResponseWithCode(res, 400);
  }

  try {
    const updated = await s.update(id, result.data);

    if (!updated) {
      logError({
        type: 'not-found',
        controller: 'updateArt',
        error: `Art with ID ${id} not found`,
      });

      return notFound(res);
    }

    const cacheKeys = artsCache
      .keys()
      .filter((key) => key.startsWith('artsData-page-'));
    artsCache.del(cacheKeys);

    return endResponseWithCode(res, 200);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'updateArt',
      error,
    });

    return internalServerError(res);
  }
};

export default updateArt;
