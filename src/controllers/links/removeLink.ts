import { type Request, type Response } from 'express';

import { linksCache } from '@/cache/index.js';
import { publishFlush } from '@/messaging/publish.js';
import * as s from '@/services/links/removeLink.js';
import { badRequest, ok, internalServerError, notFound } from '@/utils/http.js';
import logError from '@/utils/logError.js';

const removeLink = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    logError({
      type: 'bad-request',
      controller: 'removeLink',
      error: 'ID is required and must be a string',
    });

    return badRequest(res);
  }

  try {
    const removed = await s.remove({ id });

    if (!removed) {
      logError({
        type: 'not-found',
        controller: 'removeLink',
        error: `Link with ID ${id} not found`,
      });

      return notFound(res);
    }

    linksCache.del('linksData');

    await publishFlush('links');

    return ok(res);
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'removeLink',
      error,
    });

    return internalServerError(res);
  }
};

export default removeLink;
