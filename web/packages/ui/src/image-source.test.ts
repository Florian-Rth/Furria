import { describe, expect, it } from 'vitest';
import { toImageSource, toViewImageSource } from './image-source';

const URLS = { smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' };

describe('toImageSource', () => {
  it.each([
    [
      'a portrait, whose long edge is its height',
      'portrait' as const,
      { src: '/m', srcSet: '/s 512w, /m 1280w, /l 2048w', sizes: '10rem' },
    ],
    [
      'a group picture, whose long edge is its width',
      'groupPicture' as const,
      { src: '/m', srcSet: '/s 640w, /m 1600w, /l 2560w', sizes: '10rem' },
    ],
    [
      'a gallery photo of its own ratio',
      2 / 3,
      { src: '/m', srcSet: '/s 427w, /m 1067w, /l 1707w', sizes: '10rem' },
    ],
  ])('names each rendition by its width for %s', (_, aspect, expected) => {
    expect(toImageSource(URLS, aspect, '10rem')).toEqual(expected);
  });

  it('has no source without a picture', () => {
    expect(toImageSource(null, 'portrait')).toBeNull();
  });
});

describe('toViewImageSource', () => {
  it.each([
    ['a landscape photo', 3 / 2, { src: '/m', srcSet: '/m 1600w, /l 2560w', sizes: '100vw' }],
    ['a portrait photo', 3 / 4, { src: '/m', srcSet: '/m 1200w, /l 1920w', sizes: '100vw' }],
  ])('offers only the view renditions for %s', (_, aspect, expected) => {
    expect(toViewImageSource(URLS, aspect, '100vw')).toEqual(expected);
  });
});
