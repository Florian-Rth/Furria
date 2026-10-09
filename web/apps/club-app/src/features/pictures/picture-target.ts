import type { KkCrop } from '@furria/ui';
import { GROUP_PICTURE_ASPECT, PORTRAIT_ASPECT } from '@/lib/pictures';

export type PictureKind = 'portrait' | 'groupPicture';

export interface PictureTarget {
  kind: PictureKind;
  ownerId: number;
}

export type PictureUploadFailure = 'tooLarge' | 'notAPhoto' | 'notAllowed' | 'gone' | 'interrupted';

export const PICTURE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

const PAYLOAD_TOO_LARGE = 413;
const UNSUPPORTED_MEDIA_TYPE = 415;
const FORBIDDEN = 403;
const NOT_FOUND = 404;

const FAILURE_BY_STATUS: Record<number, PictureUploadFailure> = {
  [PAYLOAD_TOO_LARGE]: 'tooLarge',
  [UNSUPPORTED_MEDIA_TYPE]: 'notAPhoto',
  [FORBIDDEN]: 'notAllowed',
  [NOT_FOUND]: 'gone',
};

export const toPictureAspect = (kind: PictureKind): number =>
  kind === 'portrait' ? PORTRAIT_ASPECT : GROUP_PICTURE_ASPECT;

export const toPicturePath = (target: PictureTarget): string =>
  target.kind === 'portrait'
    ? `/api/persons/${target.ownerId}/portrait`
    : `/api/groups/${target.ownerId}/picture`;

const toUploadOwner = (target: PictureTarget): string =>
  target.kind === 'portrait' ? `person:${target.ownerId}` : `group:${target.ownerId}`;

export const toCropToken = (crop: KkCrop): string =>
  [crop.left, crop.top, crop.width, crop.height].join(',');

export const toUploadMetadata = (
  target: PictureTarget,
  fileName: string,
  crop: KkCrop | null,
): Record<string, string> =>
  crop === null
    ? { owner: toUploadOwner(target), filename: fileName }
    : { owner: toUploadOwner(target), filename: fileName, crop: toCropToken(crop) };

export const toUploadFailure = (status: number | null): PictureUploadFailure =>
  (status === null ? undefined : FAILURE_BY_STATUS[status]) ?? 'interrupted';
