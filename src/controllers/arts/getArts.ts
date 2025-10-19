import { type Request, type Response } from 'express';
import NodeCache from 'node-cache';

import type { Arts } from '@/models/arts/index.js';
import * as s from '@/services/arts/getArts.js';
import { getEndOfDayTTL } from '@/utils/getEndOfDayTTL.js';
import {
  endResponseWithCode,
  internalServerError,
  notFound,
  sendJson,
} from '@/utils/http.js';
import logError from '@/utils/logError.js';

const artsTTL = getEndOfDayTTL();
export const artsCache = new NodeCache({ stdTTL: artsTTL });

const getArts = async (req: Request, res: Response) => {
  const { page } = req.query;

  if (!page) {
    logError({
      type: 'bad-request',
      controller: 'getArts',
      error: 'Missing page query parameter',
    });

    return endResponseWithCode(res, 400);
  }

  const cacheKey = `artsData-page-${page}`;

  const cachedData = artsCache.get<Arts>(cacheKey);

  if (cachedData) return sendJson(res, cachedData);

  try {
    const artsJson = await s.get({ page: Number(page) });

    if (artsJson === null) {
      logError({
        type: 'not-found',
        controller: 'getArts',
        error: 'Arts data not found',
      });

      return notFound(res);
    }

    artsCache.set(cacheKey, artsJson);

    return sendJson(res, artsJson);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'getArts',
      error,
    });

    return internalServerError(res);
  }
};

export default getArts;
