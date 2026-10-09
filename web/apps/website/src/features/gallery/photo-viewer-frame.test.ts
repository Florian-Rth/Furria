import { describe, expect, it } from 'vitest';
import type { AlbumPhotoEntry } from './gallery-content';
import { resolvePhotoViewerFrame } from './photo-viewer-frame';

const entries = (photoCount: number): AlbumPhotoEntry[] =>
  Array.from({ length: photoCount }, (_, index) => ({
    photo: {
      mediaItemId: index + 1,
      width: 1600,
      height: 1200,
      aspect: 4 / 3,
      orientation: 'landscape' as const,
      caption: null,
      smallUrl: '/s',
      mediumUrl: '/m',
      largeUrl: '/l',
    },
    index,
    alt: `Bild ${index + 1}`,
    sourceSet: '/s 400w',
  }));

describe('resolvePhotoViewerFrame', () => {
  it.each([
    [4, { position: 5, previousDisabled: false, nextDisabled: false }],
    [0, { position: 1, previousDisabled: true, nextDisabled: false }],
    [11, { position: 12, previousDisabled: false, nextDisabled: true }],
  ])('frames the photo at index %i of twelve', (shownIndex, frame) => {
    expect(resolvePhotoViewerFrame(entries(12), shownIndex)).toMatchObject(frame);
  });

  it.each([null, 12])('has no frame for the index %s', (shownIndex) => {
    expect(resolvePhotoViewerFrame(entries(12), shownIndex)).toBeNull();
  });
});
