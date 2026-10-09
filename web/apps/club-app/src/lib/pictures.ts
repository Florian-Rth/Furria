import { toPictureSourceSet } from '@furria/ui';
import type { Picture } from '@/lib/api/schemas';

export const PORTRAIT_ASPECT = 4 / 5;
export const GROUP_PICTURE_ASPECT = 3 / 2;

export interface PictureSources {
  source: string | undefined;
  sourceSet: string | undefined;
}

export const toPictureSources = (picture: Picture | null, aspect: number): PictureSources =>
  picture === null
    ? { source: undefined, sourceSet: undefined }
    : { source: picture.mediumUrl, sourceSet: toPictureSourceSet(picture, aspect) };
