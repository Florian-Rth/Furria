import { describe, expect, it } from 'vitest';
import type { HubAlbumMark } from './hub-view';
import {
  albumMarkOf,
  inboxOwnerOf,
  newestAlbumsOf,
  ownInboxFirst,
  sectionCountsOf,
  stripMediaOf,
} from './hub-view';
import type { GalleryHubAlbum, GalleryMedia, InboxSummary } from './schemas';

const NOW = new Date('2026-10-09T12:00:00Z');

const media = (mediaItemId: number): GalleryMedia => ({
  mediaItemId,
  kind: 'photo',
  state: 'ready',
  width: 400,
  height: 300,
  capturedAt: null,
  urls: {
    small: `s${mediaItemId}`,
    medium: null,
    large: null,
    poster: null,
    video: null,
    original: `o${mediaItemId}`,
    download: `d${mediaItemId}`,
  },
});

const album = (albumId: number, createdAt: string): GalleryHubAlbum => ({
  albumId,
  title: `Album ${albumId}`,
  entryStartsAt: null,
  sessionStartYear: 2025,
  createdAt,
  isPublished: false,
  photos: 1,
  videos: 0,
  selectionCount: 0,
  cover: null,
  samples: [],
});

const inbox = (personId: number | null, latestUploadedAt: string): InboxSummary => ({
  uploader: personId === null ? null : { personId, firstName: 'A', lastName: 'B' },
  photos: 1,
  videos: 0,
  latestUploadedAt,
});

describe('albumMarkOf', () => {
  it.each<[string, boolean, string, number, boolean, HubAlbumMark]>([
    ['published wins over new', true, '2026-10-08T00:00:00Z', 3, true, { kind: 'published' }],
    ['created 13 days ago is new', false, '2026-09-26T13:00:00Z', 3, true, { kind: 'new' }],
    [
      'created 15 days ago shows its selection',
      false,
      '2026-09-24T00:00:00Z',
      3,
      true,
      { kind: 'selection', count: 3 },
    ],
    [
      'selection hidden without the right',
      false,
      '2026-09-24T00:00:00Z',
      3,
      false,
      { kind: 'none' },
    ],
    ['empty selection shows nothing', false, '2026-09-24T00:00:00Z', 0, true, { kind: 'none' }],
  ])('%s', (_, isPublished, createdAt, selectionCount, showsSelection, expected) => {
    expect(albumMarkOf({ isPublished, createdAt, selectionCount }, NOW, showsSelection)).toEqual(
      expected,
    );
  });
});

describe('stripMediaOf', () => {
  it.each<[string, GalleryMedia | null, GalleryMedia[], number[]]>([
    ['no cover keeps the samples', null, [media(1), media(2)], [1, 2]],
    ['the cover leads', media(9), [media(1), media(2)], [9, 1, 2]],
    ['a cover among the samples appears once', media(2), [media(1), media(2)], [2, 1]],
  ])('%s', (_, cover, samples, expected) => {
    expect(stripMediaOf({ cover, samples }).map((item) => item.mediaItemId)).toEqual(expected);
  });
});

describe('sectionCountsOf', () => {
  it('sums photos and videos', () => {
    expect(
      sectionCountsOf([
        { photos: 3, videos: 1 },
        { photos: 5, videos: 0 },
      ]),
    ).toEqual({ photos: 8, videos: 1 });
  });
});

describe('newestAlbumsOf', () => {
  it('takes the most recently created albums first', () => {
    const albums = [
      album(1, '2026-01-01T00:00:00Z'),
      album(2, '2026-03-01T00:00:00Z'),
      album(3, '2026-02-01T00:00:00Z'),
    ];
    expect(newestAlbumsOf(albums, 2).map((entry) => entry.albumId)).toEqual([2, 3]);
  });
});

describe('inboxOwnerOf', () => {
  it.each([
    [inbox(7, '2026-10-01T00:00:00Z'), { kind: 'uploader', personId: 7 }],
    [inbox(null, '2026-10-01T00:00:00Z'), { kind: 'ownerless' }],
  ])('maps the uploader to an owner', (summary, expected) => {
    expect(inboxOwnerOf(summary)).toEqual(expected);
  });
});

describe('ownInboxFirst', () => {
  it('puts the viewer first, then the most recent uploads', () => {
    const inboxes = [
      inbox(1, '2026-10-05T00:00:00Z'),
      inbox(null, '2026-10-07T00:00:00Z'),
      inbox(2, '2026-10-01T00:00:00Z'),
    ];
    expect(ownInboxFirst(inboxes, 2).map((entry) => entry.uploader?.personId ?? null)).toEqual([
      2,
      null,
      1,
    ]);
  });
});
