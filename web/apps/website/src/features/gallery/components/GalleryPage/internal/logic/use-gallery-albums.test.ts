import { describe, expect, it } from 'vitest';
import type { Album } from '@/features/gallery/gallery-content';
import { selectGalleryAlbums } from './use-gallery-albums';

const INSIDE_CURRENT_SESSION = new Date(2026, 6, 28);

const album = (slug: string, date: string): Album => ({
  slug,
  title: slug,
  date,
  venue: 'Festhalle',
  intro: 'Intro',
  photoCredit: 'Wegwerfkamera vom Kiosk',
  photos: [{ orientation: 'landscape', alt: 'Bild 1' }],
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

  it('has nothing to show without Albums', () => {
    expect(selectGalleryAlbums([], INSIDE_CURRENT_SESSION)).toEqual({
      featuredAlbum: undefined,
      currentSessionAlbums: [],
      olderSessionGroups: [],
    });
  });
});
