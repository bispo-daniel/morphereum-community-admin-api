import jwt from 'jsonwebtoken';

import { AuthModel } from '@/models/auth/index.js';
import { env } from '@/config/index.js';

const EXPIRATION_TIME = '1h';

const auth = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await AuthModel.findOne({ email });

  if (!user) return null;

  const isPasswordValid = user.password === password;
  if (!isPasswordValid) return null;

  const token = jwt.sign(
    { id: user._id, email: user.email },
    env.JWT_SECRET_KEY,
    {
      expiresIn: EXPIRATION_TIME,
    }
  );

  return { token };
};

export { auth };
