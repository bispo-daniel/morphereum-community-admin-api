import { type Request, type Response } from 'express';

import { linksCache } from '@/cache/index.js';
import { publishFlush } from '@/messaging/publish.js';
import { LinkSchema } from '@/models/links/index.js';
import * as s from '@/services/links/createLink.js';
import { badRequest, ok, internalServerError } from '@/utils/http.js';
import logError from '@/utils/logError.js';

const bodySchema = LinkSchema.omit({ _id: true });

const createLink = async (req: Request, res: Response) => {
  const result = bodySchema.safeParse(req.body);

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'createLink',
      error: result.error,
    });

    return badRequest(res);
  }

  const { icon, label, type, url } = result.data;

  try {
    await s.create({ icon, label, type, url });

    linksCache.del('linksData');

    await publishFlush('links');
    
    return ok(res);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'createLink',
      error,
    });

    return internalServerError(res);
  }
};

export default createLink;
