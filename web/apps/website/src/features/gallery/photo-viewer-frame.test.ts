import { describe, expect, it } from 'vitest';
import type { Album } from './gallery-content';
import { resolvePhotoViewerFrame } from './photo-viewer-frame';

const album = (photoCount: number): Album => ({
  slug: 'prunksitzung',
  title: 'Prunksitzung',
  date: '2026-02-14',
  venue: 'Festhalle',
  intro: 'Intro',
  photoCredit: 'Wegwerfkamera vom Kiosk',
  photos: Array.from({ length: photoCount }, (_, index) => ({
    orientation: 'landscape' as const,
    alt: `Bild ${index + 1}`,
  })),
});

describe('resolvePhotoViewerFrame', () => {
  it.each([
    [4, { position: 5, previousDisabled: false, nextDisabled: false }],
    [0, { position: 1, previousDisabled: true, nextDisabled: false }],
    [11, { position: 12, previousDisabled: false, nextDisabled: true }],
  ])('frames the photo at index %i of twelve', (shownIndex, frame) => {
    expect(resolvePhotoViewerFrame(album(12), shownIndex)).toMatchObject(frame);
  });

  it.each([null, 12])('has no frame for the index %s', (shownIndex) => {
    expect(resolvePhotoViewerFrame(album(12), shownIndex)).toBeNull();
  });
});
