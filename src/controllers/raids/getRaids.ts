import { type Request, type Response } from 'express';
import NodeCache from 'node-cache';

import type { Raid } from '@/models/raids/index.js';
import * as s from '@/services/raids/getRaids.js';
import { getEndOfDayTTL } from '@/utils/getEndOfDayTTL.js';
import { internalServerError, notFound, sendJson } from '@/utils/http.js';
import logError from '@/utils/logError.js';

const raidTTL = getEndOfDayTTL();
export const raidCache = new NodeCache({ stdTTL: raidTTL });

const getRaids = async (_req: Request, res: Response) => {
  const cacheKey = 'raidsData';

  const cachedData = raidCache.get<Raid[]>(cacheKey);

  if (cachedData) return sendJson(res, cachedData);

  try {
    const raidJson = await s.get();

    if (raidJson === null) {
      logError({
        type: 'not-found',
        controller: 'getRaids',
        error: 'Raid data not found',
      });

      return notFound(res);
    }

    raidCache.set(cacheKey, raidJson);

    return sendJson(res, raidJson);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'getRaids',
      error,
    });

    return internalServerError(res);
  }
};

export default getRaids;
