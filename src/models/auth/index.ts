import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';

export const AuthSchema = z.object({
  _id: z.custom<Types.ObjectId>(),
  email: z.string().nonempty(),
  password: z.string().nonempty(),
});

export type Auth = z.infer<typeof AuthSchema>;

const authSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

export const AuthModel = model('Auth', authSchema);
