import { type Request, type Response } from 'express';
import NodeCache from 'node-cache';

import type { Links } from '@/models/links/index.js';
import * as s from '@/services/links/getLinks.js';
import { getEndOfDayTTL } from '@/utils/getEndOfDayTTL.js';
import { internalServerError, notFound, sendJson } from '@/utils/http.js';
import logError from '@/utils/logError.js';

const linksTTL = getEndOfDayTTL();
export const linksCache = new NodeCache({ stdTTL: linksTTL });

const getLinks = async (_req: Request, res: Response) => {
  const cacheKey = 'linksData';

  const cachedData = linksCache.get<Links>(cacheKey);

  if (cachedData) return sendJson(res, cachedData);

  try {
    const linksJson = await s.get();

    if (linksJson === null) {
      logError({
        type: 'not-found',
        controller: 'getLinks',
        error: 'Links data not found',
      });

      return notFound(res);
    }

    linksCache.set(cacheKey, linksJson);

    return sendJson(res, linksJson);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'getLinks',
      error,
    });

    return internalServerError(res);
  }
};

export default getLinks;
