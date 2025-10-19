import { type Request, type Response } from 'express';

import { linksCache } from '@/controllers/links/getLinks.js';
import { LinkSchema } from '@/models/links/index.js';
import * as s from '@/services/links/updateLink.js';
import {
  endResponseWithCode,
  internalServerError,
  notFound,
} from '@/utils/http.js';
import logError from '@/utils/logError.js';

const bodySchema = LinkSchema.omit({ _id: true });

const updateLink = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = bodySchema.safeParse(req.body);

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'updateLink',
      error: 'ID is required and must be a string',
    });

    return endResponseWithCode(res, 400);
  }

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'updateLink',
      error: result.error.format(),
    });

    return endResponseWithCode(res, 400);
  }

  const { icon, label, type, url } = result.data;

  try {
    const updated = await s.update(id, { icon, label, type, url });

    if (!updated) {
      logError({
        type: 'not-found',
        controller: 'updateLink',
        error: `Link with ID ${id} not found`,
      });

      return notFound(res);
    }

    linksCache.del('linksData');

    return endResponseWithCode(res, 200);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'updateLink',
      error,
    });

    return internalServerError(res);
  }
};

export default updateLink;
