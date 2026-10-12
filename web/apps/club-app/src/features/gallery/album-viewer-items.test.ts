import { describe, expect, it } from 'vitest';
import type { AlbumFrame } from './album-frames';
import { albumViewerItemOf } from './album-viewer-items';
import type { AlbumItem } from './schemas';

const PHOTO: AlbumItem = {
  mediaItemId: 7,
  kind: 'photo',
  state: 'ready',
  width: 3000,
  height: 2000,
  durationSeconds: null,
  capturedAt: null,
  uploadedAt: '2026-10-03T17:00:00Z',
  camera: null,
  originalFileName: 'a.jpg',
  urls: {
    small: '/s.webp',
    medium: '/m.webp',
    large: '/l.webp',
    poster: null,
    video: null,
    original: '/o.jpg',
    download: '/d',
  },
  uploader: null,
  selectionPosition: null,
  caption: null,
};

const VIDEO: AlbumItem = {
  ...PHOTO,
  kind: 'video',
  durationSeconds: 75,
  urls: { ...PHOTO.urls, medium: null, large: null, poster: '/p.webp', video: '/v.mp4' },
};

const frameOf = (item: AlbumItem): AlbumFrame => ({
  id: item.mediaItemId,
  number: 3,
  capturedAt: null,
  item,
});

describe('albumViewerItemOf', () => {
  it.each<[string, AlbumItem, string | null, boolean, boolean]>([
    ['ready photo with renditions', PHOTO, '/m.webp', true, false],
    [
      'photo without large rendition',
      { ...PHOTO, urls: { ...PHOTO.urls, large: null } },
      '/m.webp',
      false,
      false,
    ],
    ['photo without dimensions', { ...PHOTO, width: null }, '/l.webp', false, false],
    ['developing photo', { ...PHOTO, state: 'processing' }, null, false, false],
    ['ready video', VIDEO, '/p.webp', false, true],
    [
      'video without poster',
      { ...VIDEO, urls: { ...VIDEO.urls, poster: null } },
      '/s.webp',
      false,
      true,
    ],
    ['developing video', { ...VIDEO, state: 'processing' }, null, false, false],
  ])('maps a %s', (_, item, src, hasSrcSet, plays) => {
    const viewerItem = albumViewerItemOf(frameOf(item), 'Herbstball');

    expect({
      src: viewerItem.image?.src ?? null,
      hasSrcSet: viewerItem.image?.srcSet !== undefined,
      plays: viewerItem.video !== undefined,
    }).toEqual({ src, hasSrcSet, plays });
  });

  it.each<[AlbumItem, { width: number; height: number } | undefined]>([
    [PHOTO, { width: 3000, height: 2000 }],
    [{ ...PHOTO, height: null }, undefined],
    [{ ...PHOTO, height: 0 }, undefined],
  ])('sizes from the stored dimensions', (item, size) => {
    expect(albumViewerItemOf(frameOf(item), 'Herbstball').size).toEqual(size);
  });
});
