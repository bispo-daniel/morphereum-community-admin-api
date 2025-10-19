import { type Request, type Response } from 'express';

import { linksCache } from '@/controllers/links/getLinks.js';
import { LinkSchema } from '@/models/links/index.js';
import * as s from '@/services/links/createLink.js';
import { endResponseWithCode, internalServerError } from '@/utils/http.js';
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

    return endResponseWithCode(res, 400);
  }

  const { icon, label, type, url } = result.data;

  try {
    await s.create({ icon, label, type, url });

    linksCache.del('linksData');

    return endResponseWithCode(res, 200);
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
