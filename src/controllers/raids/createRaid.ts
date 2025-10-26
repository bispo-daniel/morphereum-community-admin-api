import { type Request, type Response } from 'express';

import { raidCache } from '@/cache/index.js';
import { publishFlush } from '@/messaging/publish.js';
import { RaidSchema } from '@/models/raids/index.js';
import * as s from '@/services/raids/createRaid.js';
import { badRequest, ok, internalServerError } from '@/utils/http.js';
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

    return badRequest(res);
  }

  const { content, date, platform, shareMessage, url } = result.data;

  try {
    await s.create({ content, date, platform, shareMessage, url });

    raidCache.del('raidsData');

    await publishFlush('raids');

    return ok(res);
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
