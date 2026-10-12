import { describe, expect, it } from 'vitest';
import { toImageSource } from './image-source';

describe('toImageSource', () => {
  it.each([
    [
      'a portrait, whose long edge is its height',
      'portrait' as const,
      { src: '/m', srcSet: '/s 320w, /m 1280w, /l 2048w', sizes: '10rem' },
    ],
    [
      'a group picture, whose long edge is its width',
      'groupPicture' as const,
      { src: '/m', srcSet: '/s 400w, /m 1600w, /l 2560w', sizes: '10rem' },
    ],
    [
      'a gallery photo of its own ratio',
      2 / 3,
      { src: '/m', srcSet: '/s 267w, /m 1067w, /l 1707w', sizes: '10rem' },
    ],
  ])('names each rendition by its width for %s', (_, aspect, expected) => {
    expect(
      toImageSource({ smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' }, aspect, '10rem'),
    ).toEqual(expected);
  });

  it('has no source without a picture', () => {
    expect(toImageSource(null, 'portrait')).toBeNull();
  });
});
