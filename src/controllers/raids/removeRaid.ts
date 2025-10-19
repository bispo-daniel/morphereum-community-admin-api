import { type Request, type Response } from 'express';

import { raidCache } from '@/controllers/raids/getRaids.js';
import * as s from '@/services/raids/removeRaid.js';
import {
  endResponseWithCode,
  internalServerError,
  notFound,
} from '@/utils/http.js';
import logError from '@/utils/logError.js';

const removeRaid = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'removeRaid',
      error: 'ID is required and must be a string',
    });

    return endResponseWithCode(res, 400);
  }

  try {
    const removed = await s.remove({ id });

    if (!removed) {
      logError({
        type: 'not-found',
        controller: 'removeRaid',
        error: `Raid with ID ${id} not found`,
      });

      return notFound(res);
    }

    raidCache.del('raidsData');

    return endResponseWithCode(res, 200);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'removeRaid',
      error,
    });

    return internalServerError(res);
  }
};

export default removeRaid;
