import { type Request, type Response } from 'express';

import { raidCache } from '@/controllers/raids/getRaids.js';
import { RaidSchema } from '@/models/raids/index.js';
import * as s from '@/services/raids/createRaid.js';
import { endResponseWithCode, internalServerError } from '@/utils/http.js';
import logError from '@/utils/logError.js';

const bodySchema = RaidSchema.omit({ _id: true });

const createRaid = async (req: Request, res: Response) => {
  const result = bodySchema.safeParse(req.body);

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'createRaid',
      error: result.error,
    });

    return endResponseWithCode(res, 400);
  }

  const { content, date, platform, shareMessage, url } = result.data;

  try {
    await s.create({ content, date, platform, shareMessage, url });

    raidCache.del('raidsData');

    return endResponseWithCode(res, 200);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'createRaid',
      error,
    });

    return internalServerError(res);
  }
};

export default createRaid;
