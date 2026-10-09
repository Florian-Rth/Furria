import { toPictureSourceSet } from '@furria/ui';
import { z } from 'zod';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { buildApiUrl } from './api-fetch';

export const PORTRAIT_ASPECT = 4 / 5;
export const GROUP_PICTURE_ASPECT = 3 / 2;

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

export interface PictureSources {
  source: string | undefined;
  sourceSet: string | undefined;
}

export const toPictureSources = (picture: Picture | null, aspect: number): PictureSources =>
  picture === null
    ? { source: undefined, sourceSet: undefined }
    : { source: picture.mediumUrl, sourceSet: toPictureSourceSet(picture, aspect) };
