import { type Request, type Response } from 'express';

import { raidCache } from '@/controllers/raids/getRaids.js';
import { RaidSchema } from '@/models/raids/index.js';
import * as s from '@/services/raids/updateRaid.js';
import {
  endResponseWithCode,
  internalServerError,
  notFound,
} from '@/utils/http.js';
import logError from '@/utils/logError.js';

const updateRaid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = RaidSchema.safeParse(req.body);

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'updateRaid',
      error: 'ID is required and must be a string',
    });

    return endResponseWithCode(res, 400);
  }

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'updateRaid',
      error: result.error,
    });

    return endResponseWithCode(res, 400);
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

    return endResponseWithCode(res, 200);
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
