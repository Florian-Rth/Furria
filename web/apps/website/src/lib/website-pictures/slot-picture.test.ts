import type { PublicWebsitePicture } from '@furria/api-client';
import type { PictureSlot } from '@furria/website-pictures';
import { describe, expect, it } from 'vitest';
import type { PublicSource } from '@/lib/public-resource/public-source';
import { slotPictureOf } from './slot-picture';

const stack: PictureSlot = {
  page: 'gallery',
  title: 'Stack',
  description: 'Stack',
  positions: ['landscape', 'portrait', 'landscape'],
  decorative: false,
};

const strip: PictureSlot = { ...stack, positions: ['landscape'], decorative: true };

const pictureAt = (slot: string, position: number, alt: string | null): PublicWebsitePicture => ({
  slot,
  position,
  width: 1400,
  height: 1000,
  alt,
  smallUrl: `/s/${slot}/${position}`,
  mediumUrl: `/m/${slot}/${position}`,
  largeUrl: `/l/${slot}/${position}`,
});

const ready = (
  ...pictures: PublicWebsitePicture[]
): PublicSource<readonly PublicWebsitePicture[]> => ({ status: 'ready', data: pictures });

const loading: PublicSource<readonly PublicWebsitePicture[]> = { status: 'loading' };
const failed: PublicSource<readonly PublicWebsitePicture[]> = { status: 'error', retry: () => {} };

describe('slotPictureOf', () => {
  it.each([
    ['a position the slot does not declare', ready(), 4, 'undeclared'],
    ['the pictures still loading', loading, 2, 'pending'],
    ['the pictures failing to load', failed, 2, 'empty'],
    ['nothing stored at the position', ready(pictureAt('gallery.stack', 1, 'Saal')), 2, 'empty'],
    ['the same position of another slot', ready(pictureAt('club.story', 2, 'Saal')), 2, 'empty'],
    ['a picture at the position', ready(pictureAt('gallery.stack', 2, 'Saal')), 2, 'filled'],
  ])('reads %s as %s', (_, source, position, state) => {
    expect(slotPictureOf(source, 'gallery.stack', stack, position, '50vw').state).toBe(state);
  });

  it('serves a filled position at its declared aspect with the caller sizes', () => {
    const picture = slotPictureOf(
      ready(pictureAt('gallery.stack', 2, 'Saal')),
      'gallery.stack',
      stack,
      2,
      '30vw',
    );

    expect(picture).toEqual({
      state: 'filled',
      aspect: 'portrait',
      alt: 'Saal',
      image: {
        src: '/m/gallery.stack/2',
        srcSet: '/s/gallery.stack/2 512w, /m/gallery.stack/2 1280w, /l/gallery.stack/2 2048w',
        sizes: '30vw',
      },
    });
  });

  it.each([
    ['a described picture of a decorative slot', strip, 'Saal', ''],
    ['a picture without alt text', stack, null, ''],
    ['a described picture', stack, 'Saal', 'Saal'],
  ])('gives %s the alt text %j', (_, slot, alt, expected) => {
    const picture = slotPictureOf(ready(pictureAt('s.lot', 1, alt)), 's.lot', slot, 1, '50vw');

    expect(picture.state === 'filled' ? picture.alt : null).toBe(expected);
  });
});
