import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.union([z.literal('development'), z.literal('production')]),
  PORT: z.coerce.number().min(1000),
  MONGODB_CONNECTION_STRING: z.string().nonempty(),
  MONGODB_DB_NAME: z.string().nonempty(),
  CLOUDINARY_CLOUD_NAME: z.string().nonempty(),
  CLOUDINARY_API_KEY: z.string().nonempty(),
  CLOUDINARY_API_SECRET: z.string().nonempty(),
  CORS_ORIGIN: z.string().nonempty(),
  JWT_SECRET_KEY: z.string().nonempty(),
  RABBITMQ_URL: z.string().nonempty(),
  RABBITMQ_EXCHANGE: z.string().default('cache.flush'),
  ART_RECORDS_PER_PAGE: z.coerce.number().min(1).default(10),
  SENTRY_DSN: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),
  SENTRY_PROFILES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),
});

export const env = envSchema.parse(process.env);
