import { type Request, type Response } from 'express';

import { raidCache } from '@/cache/index.js';
import * as s from '@/services/raids/removeRaid.js';
import { badRequest, ok, internalServerError, notFound } from '@/utils/http.js';
import logError from '@/utils/logError.js';
import { publishFlush } from '@/messaging/publish.js';

const removeRaid = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'removeRaid',
      error: 'ID is required and must be a string',
    });

    return badRequest(res);
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

    await publishFlush('raids');

    return ok(res);
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
