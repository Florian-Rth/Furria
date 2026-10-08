import { describe, expect, it } from 'vitest';
import type { Album } from './gallery-content';
import {
  countPhotos,
  selectCurrentSessionAlbums,
  selectGalleryAlbums,
  selectNextAlbum,
  selectOlderSessionGroups,
} from './gallery-content';

const INSIDE_CURRENT_SESSION = new Date(2026, 6, 28);

const album = (slug: string, date: string, photoCount = 1): Album => ({
  slug,
  title: slug,
  date,
  venue: 'Festhalle',
  intro: 'Intro',
  photoCredit: 'Wegwerfkamera vom Kiosk',
  photos: Array.from({ length: photoCount }, () => ({ orientation: 'landscape', alt: 'Bild' })),
});

describe('countPhotos', () => {
  it('sums the photos across every Album', () => {
    expect(countPhotos([album('a', '2026-01-10', 3), album('b', '2026-02-14', 4)])).toBe(7);
  });
});

describe('selectNextAlbum', () => {
  const albums = [
    album('erstes', '2026-01-10'),
    album('zweites', '2026-02-14'),
    album('drittes', '2026-03-01'),
  ];

  it.each([
    ['walks to the next older Album', albums, 'drittes', 'zweites'],
    ['wraps from the oldest Album back to the newest', albums, 'erstes', 'drittes'],
    ['has none for an unknown slug', albums, 'gibt-es-nicht', undefined],
    ['has none for a lone Album', [album('einzeln', '2026-01-10')], 'einzeln', undefined],
  ])('%s', (_, subject, currentSlug, nextSlug) => {
    expect(selectNextAlbum(subject, currentSlug)?.slug).toBe(nextSlug);
  });
});

describe('selectCurrentSessionAlbums', () => {
  it('keeps only the Alben of the open Session, newest first', () => {
    const albums = [
      album('vorsession', '2025-02-10'),
      album('session-frueh', '2025-12-20'),
      album('session-spaet', '2026-02-14'),
    ];

    expect(
      selectCurrentSessionAlbums(albums, INSIDE_CURRENT_SESSION).map((entry) => entry.slug),
    ).toEqual(['session-spaet', 'session-frueh']);
  });
});

describe('selectOlderSessionGroups', () => {
  it('groups the older Alben per Session, newest Session first', () => {
    const albums = [
      album('sehr-alt', '2024-02-05'),
      album('alt-frueh', '2025-01-10'),
      album('alt-spaet', '2025-02-20'),
      album('offen', '2026-02-14'),
    ];

    const groups = selectOlderSessionGroups(albums, INSIDE_CURRENT_SESSION);

    expect(groups.map((group) => group.session.startYear)).toEqual([2024, 2023]);
    expect(groups[0]?.albums.map((entry) => entry.slug)).toEqual(['alt-spaet', 'alt-frueh']);
  });
});

describe('selectGalleryAlbums', () => {
  it('features the newest Album and keeps it out of the sections below', () => {
    const albums = [
      album('umzug', '2026-02-15'),
      album('prunksitzung', '2026-02-14'),
      album('kappenabend', '2025-02-08'),
    ];

    const { featuredAlbum, currentSessionAlbums, olderSessionGroups } = selectGalleryAlbums(
      albums,
      INSIDE_CURRENT_SESSION,
    );

    expect(featuredAlbum?.slug).toBe('umzug');
    expect(currentSessionAlbums.map((entry) => entry.slug)).toEqual(['prunksitzung']);
    expect(olderSessionGroups.map((group) => group.session.startYear)).toEqual([2024]);
  });
});
