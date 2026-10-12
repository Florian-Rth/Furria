import type { UploadOwner } from '@/lib/media/media-upload';

export type PictureKind = 'portrait' | 'groupPicture';

export interface PictureTarget {
  kind: PictureKind;
  ownerId: number;
}

export const PICTURE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

export const toPicturePath = (target: PictureTarget): string =>
  target.kind === 'portrait'
    ? `/api/persons/${target.ownerId}/portrait`
    : `/api/groups/${target.ownerId}/picture`;

export const toUploadOwner = (target: PictureTarget): UploadOwner => ({
  kind: target.kind === 'portrait' ? 'person' : 'group',
  id: target.ownerId,
});
