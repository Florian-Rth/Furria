import { z } from 'zod';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { buildApiUrl } from './api-fetch';

const MediaUrlSchema = z
  .string()
  .min(1)
  .transform((path) => buildApiUrl(readApiBaseUrl(), path));

export const PictureSchema = z.object({
  smallUrl: MediaUrlSchema,
  mediumUrl: MediaUrlSchema,
  largeUrl: MediaUrlSchema,
});

export type Picture = z.infer<typeof PictureSchema>;
