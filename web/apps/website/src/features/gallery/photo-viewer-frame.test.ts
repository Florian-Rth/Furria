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
  it('describes the shown photo with a one-based position', () => {
    const frame = resolvePhotoViewerFrame(album(12), 4);

    expect(frame).toMatchObject({
      placeholderLabel: 'prunksitzung-05',
      position: 5,
      countSuffix: ' von 12',
      previousDisabled: false,
      nextDisabled: false,
    });
    expect(frame?.photo.alt).toBe('Bild 5');
  });

  it('disables stepping past the first and the last photo', () => {
    expect(resolvePhotoViewerFrame(album(3), 0)?.previousDisabled).toBe(true);
    expect(resolvePhotoViewerFrame(album(3), 2)?.nextDisabled).toBe(true);
  });

  it('has no frame while the viewer is closed', () => {
    expect(resolvePhotoViewerFrame(album(3), null)).toBeNull();
  });

  it('has no frame for a photo the Album does not hold', () => {
    expect(resolvePhotoViewerFrame(album(3), 7)).toBeNull();
  });
});
