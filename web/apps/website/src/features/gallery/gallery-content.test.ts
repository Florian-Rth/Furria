import { describe, expect, it } from 'vitest';
import type { AlbumPhoto, AlbumSummary, GallerySection } from '@/lib/public-gallery/schemas';
import {
  buildAlbumMeta,
  buildPhotoAlt,
  buildSessionLabel,
  selectGalleryAlbums,
  selectNextAlbum,
} from './gallery-content';

const INSIDE_SESSION_2025 = new Date(2026, 6, 28);

const session = (startYear: number, number: number | null = null): GallerySection['session'] => ({
  startYear,
  yearsLabel: `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`,
  number,
});

const album = (albumId: number, startYear: number, photoCount = 1): AlbumSummary => ({
  albumId,
  title: `Album ${albumId}`,
  entryStartsAt: null,
  photoCount,
  cover: {
    mediaItemId: albumId * 10,
    width: 1600,
    height: 1200,
    aspect: 4 / 3,
    orientation: 'landscape',
    smallUrl: '/s',
    mediumUrl: '/m',
    largeUrl: '/l',
  },
  session: session(startYear),
});

const section = (startYear: number, albumIds: number[]): GallerySection => ({
  session: session(startYear),
  albums: albumIds.map((albumId) => album(albumId, startYear)),
});

const ids = (albums: AlbumSummary[]): number[] => albums.map((entry) => entry.albumId);

describe('selectGalleryAlbums', () => {
  it('features the first Album and keeps it out of the sections below', () => {
    const { featuredAlbum, currentSessionAlbums, olderSessionGroups } = selectGalleryAlbums(
      [section(2025, [3, 2]), section(2024, [1])],
      INSIDE_SESSION_2025,
    );

    expect(featuredAlbum?.albumId).toBe(3);
    expect(ids(currentSessionAlbums)).toEqual([2]);
    expect(olderSessionGroups.map((group) => [group.session.startYear, ids(group.albums)])).toEqual(
      [[2024, [1]]],
    );
  });

  it('drops an older Session left empty by the featured Album', () => {
    const { featuredAlbum, currentSessionAlbums, olderSessionGroups } = selectGalleryAlbums(
      [section(2023, [5]), section(2022, [4])],
      INSIDE_SESSION_2025,
    );

    expect(featuredAlbum?.albumId).toBe(5);
    expect(currentSessionAlbums).toEqual([]);
    expect(olderSessionGroups.map((group) => group.session.startYear)).toEqual([2022]);
  });

  it('has nothing to feature in an empty gallery', () => {
    expect(selectGalleryAlbums([], INSIDE_SESSION_2025)).toEqual({
      featuredAlbum: undefined,
      currentSessionAlbums: [],
      olderSessionGroups: [],
    });
  });
});

describe('selectNextAlbum', () => {
  const sections = [section(2025, [3, 2]), section(2024, [1])];

  it.each([
    ['walks to the next older Album across Sessions', sections, 2, 1],
    ['wraps from the oldest Album back to the newest', sections, 1, 3],
    ['has none for an unknown Album', sections, 99, undefined],
    ['has none for a lone Album', [section(2025, [7])], 7, undefined],
  ])('%s', (_, subject, currentAlbumId, nextAlbumId) => {
    expect(selectNextAlbum(subject, currentAlbumId)?.albumId).toBe(nextAlbumId);
  });
});

describe('buildSessionLabel', () => {
  it.each([
    [session(2025, 67), '67. Session 2025/26'],
    [session(2099), 'Session 2099/00'],
  ])('labels %j', (subject, label) => {
    expect(buildSessionLabel(subject)).toBe(label);
  });
});

describe('buildAlbumMeta', () => {
  it.each([
    ['2026-02-14T19:11', '14. Februar 2026 · Session 2025/26'],
    [null, 'Session 2025/26'],
  ])('dates an Album on %s', (entryStartsAt, meta) => {
    expect(buildAlbumMeta({ entryStartsAt, session: session(2025) })).toBe(meta);
  });
});

describe('buildPhotoAlt', () => {
  const photo = (caption: string | null): AlbumPhoto => ({
    mediaItemId: 1,
    width: 1200,
    height: 1600,
    aspect: 3 / 4,
    orientation: 'portrait',
    caption,
    smallUrl: '/s',
    mediumUrl: '/m',
    largeUrl: '/l',
  });

  it.each([
    ['Finale mit allen Gruppen', 'Finale mit allen Gruppen'],
    [null, 'Prunksitzung, Foto 3'],
  ])('describes a photo captioned %s', (caption, alt) => {
    expect(buildPhotoAlt('Prunksitzung', photo(caption), 2)).toBe(alt);
  });
});
