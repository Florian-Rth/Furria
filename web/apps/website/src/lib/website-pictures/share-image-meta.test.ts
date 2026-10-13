import { describe, expect, it } from 'vitest';
import { siteShareImageMeta } from './share-image-meta';

const sharePicture = (alt: string | null) => ({
  slot: 'site.shareImage',
  position: 1,
  width: 1910,
  height: 1000,
  alt,
  smallUrl: '/s',
  mediumUrl: '/m',
  largeUrl: '/l',
});

describe('siteShareImageMeta', () => {
  it.each([
    ['nothing stored', [], []],
    ['a share image without alt text', [sharePicture(null)], []],
    ['a share image with empty alt text', [sharePicture('')], []],
    [
      'a share image with alt text',
      [sharePicture('Garde auf der Bühne')],
      [{ property: 'og:image:alt', content: 'Garde auf der Bühne' }],
    ],
  ])('describes the site share image with %s', (_, pictures, altMeta) => {
    expect(siteShareImageMeta(pictures)).toEqual([
      { property: 'og:image', content: '/api/public/website-pictures/site.shareImage/1/medium' },
      ...altMeta,
    ]);
  });
});
