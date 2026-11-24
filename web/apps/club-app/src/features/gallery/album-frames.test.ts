import { describe, expect, it } from 'vitest';
import { selectionWith } from './album-frames';
import type { AlbumItem } from './schemas';

const urls = {
  small: 'https://api.test/s',
  medium: null,
  large: null,
  poster: null,
  video: null,
  original: 'https://api.test/o',
  download: 'https://api.test/d',
};

const item = (
  mediaItemId: number,
  selectionPosition: number | null,
  overrides: Partial<AlbumItem> = {},
): AlbumItem => ({
  mediaItemId,
  kind: 'photo',
  state: 'ready',
  isStalled: false,
  width: 4000,
  height: 3000,
  durationSeconds: null,
  capturedAt: null,
  uploadedAt: '2026-02-14T20:00:00Z',
  camera: null,
  originalFileName: `IMG_${mediaItemId}.jpg`,
  uploader: null,
  selectionPosition,
  caption: selectionPosition === null ? null : `Bild ${mediaItemId}`,
  urls,
  ...overrides,
});

describe('selectionWith', () => {
  it('appends ready photos in album order behind the kept selection and keeps captions', () => {
    const items = [
      item(1, null),
      item(2, 2),
      item(3, null, { kind: 'video' }),
      item(4, 1),
      item(5, null, { state: 'processing' }),
      item(6, null),
    ];
    expect(selectionWith(items, new Set([6, 1, 3, 5, 2]))).toEqual([
      { mediaItemId: 4, caption: 'Bild 4' },
      { mediaItemId: 2, caption: 'Bild 2' },
      { mediaItemId: 1, caption: null },
      { mediaItemId: 6, caption: null },
    ]);
  });
});
