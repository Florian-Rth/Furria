import type { PublicWebsitePicture } from '@furria/api-client';
import type { KkAspect } from '@furria/ui/image-aspect';
import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { PictureSlot } from '@furria/website-pictures';
import type { PublicSource } from '@/lib/public-resource/public-source';

export type SlotPicture =
  | { state: 'undeclared' }
  | { state: 'pending'; aspect: KkAspect }
  | { state: 'empty'; aspect: KkAspect }
  | { state: 'filled'; aspect: KkAspect; image: KkImageSource; alt: string };

const FIRST_POSITION = 1;
const DECORATIVE_ALT = '';

type WebsitePictures = PublicSource<readonly PublicWebsitePicture[]>;

const storedAt = (
  pictures: readonly PublicWebsitePicture[],
  key: string,
  position: number,
): PublicWebsitePicture | undefined =>
  pictures.find((picture) => picture.slot === key && picture.position === position);

const declaredPositionsOf = (slot: PictureSlot): number[] =>
  slot.positions.map((_, index) => index + FIRST_POSITION);

export const slotPictureOf = (
  source: WebsitePictures,
  key: string,
  slot: PictureSlot,
  position: number,
  sizes: string,
): SlotPicture => {
  const aspect = slot.positions[position - FIRST_POSITION];

  if (aspect === undefined) {
    return { state: 'undeclared' };
  }

  if (source.status === 'loading') {
    return { state: 'pending', aspect };
  }

  const picture = source.status === 'ready' ? storedAt(source.data, key, position) : undefined;
  const image = picture === undefined ? null : toImageSource(picture, aspect, sizes);

  if (picture === undefined || image === null) {
    return { state: 'empty', aspect };
  }

  const alt = slot.decorative ? DECORATIVE_ALT : (picture.alt ?? DECORATIVE_ALT);
  return { state: 'filled', aspect, image, alt };
};

export const filledPositionsOf = (
  source: WebsitePictures,
  key: string,
  slot: PictureSlot,
): number[] =>
  source.status === 'ready'
    ? declaredPositionsOf(slot).filter(
        (position) => storedAt(source.data, key, position) !== undefined,
      )
    : [];

export const framedPositionsOf = (
  source: WebsitePictures,
  key: string,
  slot: PictureSlot,
): number[] => {
  const filled = filledPositionsOf(source, key, slot);

  return filled.length > 0 ? filled : declaredPositionsOf(slot);
};
