import { type Request, type Response } from 'express';

import { AuthSchema } from '@/models/auth/index.js';
import * as s from '@/services/auth/index.js';
import {
  badRequest,
  unauthorized,
  internalServerError,
  sendJson,
} from '@/utils/http.js';
import logError from '@/utils/logError.js';

const bodySchema = AuthSchema.omit({ _id: true });

const auth = async (req: Request, res: Response) => {
  const result = bodySchema.safeParse(req.body);

  if (!result.success) {
    logError({
      type: 'bad-request',
      controller: 'auth',
      error: result.error,
    });

    return badRequest(res);
  }

  const { email, password } = result.data;

  try {
    const authenticated = await s.auth({ email, password });

    if (!authenticated) {
      logError({
        type: 'unauthorized',
        controller: 'auth',
        error: 'Invalid credentials',
      });

      return unauthorized(res);
    }

    return sendJson(res, { token: authenticated.token });
  } catch (error) {
    logError({
      type: 'internal-server-error',
      controller: 'auth',
      error,
    });

    return internalServerError(res);
  }
};

export default auth;
