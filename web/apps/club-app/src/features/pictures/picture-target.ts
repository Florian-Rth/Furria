import type { KkAspect } from '@furria/ui';
import type { UploadOwner } from '@/lib/media/media-upload';
import type { DomainChange } from '@/lib/query/reads';

export type PictureKind = 'portrait' | 'groupPicture' | 'eventPicture';

export interface PictureTarget {
  kind: PictureKind;
  ownerId: number;
}

export const PICTURE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

export const PICTURE_ASPECTS: Record<PictureKind, KkAspect> = {
  portrait: 'portrait',
  groupPicture: 'groupPicture',
  eventPicture: 'banner',
};

export const PICTURE_DESK_IDS: Record<PictureKind, string> = {
  portrait: 'portrait',
  groupPicture: 'group-picture',
  eventPicture: 'event-picture',
};

export const PICTURE_CHANGES: Record<PictureKind, readonly DomainChange[]> = {
  portrait: ['picture'],
  groupPicture: ['picture'],
  eventPicture: ['event'],
};

const OWNER_KINDS: Record<PictureKind, 'person' | 'group' | 'event'> = {
  portrait: 'person',
  groupPicture: 'group',
  eventPicture: 'event',
};

export const toPicturePath = (target: PictureTarget): string => {
  switch (target.kind) {
    case 'portrait':
      return `/api/persons/${target.ownerId}/portrait`;
    case 'groupPicture':
      return `/api/groups/${target.ownerId}/picture`;
    case 'eventPicture':
      return `/api/events/${target.ownerId}/picture`;
  }
};

export const toUploadOwner = (target: PictureTarget): UploadOwner => ({
  kind: OWNER_KINDS[target.kind],
  id: target.ownerId,
});
