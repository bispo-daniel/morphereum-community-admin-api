import { type Request, type Response } from 'express';

import { raidCache } from '@/cache/index.js';
import { RaidSchema } from '@/models/raids/index.js';
import * as s from '@/services/raids/updateRaid.js';
import { badRequest, ok, internalServerError, notFound } from '@/utils/http.js';
import logError from '@/utils/logError.js';
import { publishFlush } from '@/messaging/publish.js';

const updateRaid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = RaidSchema.safeParse(req.body);

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'updateRaid',
      error: 'ID is required and must be a string',
    });

    return badRequest(res);
  }

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'updateRaid',
      error: result.error,
    });

    return badRequest(res);
  }

  try {
    const updatedRaid = await s.update(id, result.data);

    if (!updatedRaid) {
      logError({
        type: 'not-found',
        controller: 'updateRaid',
        error: `Raid com ID ${id} não encontrada.`,
      });

      return notFound(res);
    }

    raidCache.del('raidsData');

    await publishFlush('raids');

    return ok(res);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'updateRaid',
      error,
    });

    return internalServerError(res);
  }
};

export default updateRaid;
