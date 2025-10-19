import mongoose, { Schema, Types } from 'mongoose';
import { z } from 'zod';

export const ArtSchema = z.object({
  _id: z.custom<Types.ObjectId>(),
  approved: z.boolean(),
  name: z.string(),
  creator: z.string(),
  xProfile: z.string(),
  description: z.string(),
  url: z.string(),
});

export type Art = z.infer<typeof ArtSchema>;

export const ArtsSchema = z.array(ArtSchema);

export type Arts = z.infer<typeof ArtsSchema>;

const artsSchema = new Schema({
  approved: { type: Boolean, required: true, default: false },
  name: { type: String, required: true },
  creator: { type: String, required: true },
  xProfile: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
});

export const ArtsModel = mongoose.model('Arts', artsSchema);
