import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthModel } from '@/models/auth/index.js';
import { unauthorized } from '@/utils/http.js';
import { env } from '@/config/index.js';
import logError from '@/utils/logError.js';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    logError({
      type: 'unauthorized',
      controller: 'authMiddleware',
      error: 'Missing token',
    });

    return unauthorized(res);
  }

  try {
    const decoded: any = jwt.verify(token, env.JWT_SECRET_KEY);

    if (!decoded || !decoded.id || !decoded.email) {
      logError({
        type: 'unauthorized',
        controller: 'authMiddleware',
        error: 'Invalid token',
      });

      return unauthorized(res);
    }

    const _id = decoded.id;
    const email = decoded.email;
    const user = await AuthModel.findOne({
      _id,
      email,
    });

    if (!user) {
      logError({
        type: 'unauthorized',
        controller: 'authMiddleware',
        error: 'User not found',
      });

      return unauthorized(res);
    }

    next();
  } catch (error) {
    logError({
      type: 'unauthorized',
      controller: 'authMiddleware',
      error: "Catched error while verifying user's token. Error: " + error,
    });

    return unauthorized(res);
  }
};

export default authMiddleware;
