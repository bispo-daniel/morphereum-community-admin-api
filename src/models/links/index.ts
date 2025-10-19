import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';

export const LinkSchema = z.object({
  _id: z.custom<Types.ObjectId>(),
  label: z.string().nonempty(),
  url: z.string().nonempty(),
  icon: z.string().nonempty(),
  type: z.enum(['community-links', 'official-links']),
});

export type Link = z.infer<typeof LinkSchema>;

export const LinksSchema = z.array(LinkSchema);

export type Links = z.infer<typeof LinksSchema>;

const linksSchema = new Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['community-links', 'official-links'],
  },
});

export const LinksModel = model('Links', linksSchema);
