import { describe, expect, it } from 'vitest';
import type { Album } from './gallery-content';
import {
  ALBUMS,
  albumSession,
  buildAlbumHref,
  buildAlbumMeta,
  buildFeaturedAlbumMeta,
  buildGalleryStats,
  buildPhotoCountLabel,
  countPhotos,
  excludeAlbum,
  findAlbumBySlug,
  selectCurrentSessionAlbums,
  selectFeaturedAlbum,
  selectOlderSessionGroups,
  sortAlbumsByDateDesc,
} from './gallery-content';

const INSIDE_CURRENT_SESSION = new Date(2026, 6, 28);

const album = (slug: string, date: string, photoCount: number): Album => ({
  slug,
  title: slug,
  date,
  venue: 'Festhalle',
  intro: 'Intro',
  photoCredit: 'Wegwerfkamera vom Kiosk',
  photos: Array.from({ length: photoCount }, (_, index) => ({
    orientation: index % 2 === 0 ? 'landscape' : 'portrait',
    alt: `Bild ${index + 1}`,
  })),
});

describe('ALBUMS', () => {
  it('gives every Album a unique slug', () => {
    const slugs = ALBUMS.map((seeded) => seeded.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('curates between eight and twelve photos per Album', () => {
    for (const seeded of ALBUMS) {
      expect(seeded.photos.length).toBeGreaterThanOrEqual(8);
      expect(seeded.photos.length).toBeLessThanOrEqual(12);
    }
  });

  it('gives every photo an orientation and a non-empty caption', () => {
    for (const photo of ALBUMS.flatMap((seeded) => seeded.photos)) {
      expect(photo.orientation === 'landscape' || photo.orientation === 'portrait').toBe(true);
      expect(photo.alt.trim()).not.toBe('');
    }
  });

  it('gives every Album the fields the index and the Album page need', () => {
    for (const seeded of ALBUMS) {
      expect(seeded.title).not.toBe('');
      expect(seeded.venue).not.toBe('');
      expect(seeded.intro).not.toBe('');
      expect(seeded.photoCredit).not.toBe('');
      expect(seeded.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('seeds four Alben in the running Session and two in an older one', () => {
    expect(selectCurrentSessionAlbums(ALBUMS, INSIDE_CURRENT_SESSION)).toHaveLength(4);
    expect(selectOlderSessionGroups(ALBUMS, INSIDE_CURRENT_SESSION)).toHaveLength(1);
    expect(selectOlderSessionGroups(ALBUMS, INSIDE_CURRENT_SESSION)[0]?.albums).toHaveLength(2);
  });
});

describe('sortAlbumsByDateDesc', () => {
  it('puts the newest Album first without mutating the input', () => {
    const albums = [album('alt', '2025-02-22', 8), album('neu', '2026-02-14', 8)];

    expect(sortAlbumsByDateDesc(albums).map((sorted) => sorted.slug)).toEqual(['neu', 'alt']);
    expect(albums.map((original) => original.slug)).toEqual(['alt', 'neu']);
  });
});

describe('albumSession', () => {
  it('derives the Session from the Album date', () => {
    expect(albumSession(album('eroeffnung', '2025-11-11', 8)).yearsLabel).toBe('2025/26');
    expect(albumSession(album('umzug', '2025-03-03', 8)).yearsLabel).toBe('2024/25');
  });
});

describe('selectCurrentSessionAlbums', () => {
  it('keeps only the running Session, newest first', () => {
    const albums = [
      album('umzug-alt', '2025-03-03', 8),
      album('sitzung', '2026-02-14', 8),
      album('eroeffnung', '2025-11-11', 8),
    ];

    expect(selectCurrentSessionAlbums(albums, INSIDE_CURRENT_SESSION).map((a) => a.slug)).toEqual([
      'sitzung',
      'eroeffnung',
    ]);
  });

  it('drops every Album once the next Session has opened', () => {
    const albums = [album('sitzung', '2026-02-14', 8)];

    expect(selectCurrentSessionAlbums(albums, new Date(2026, 10, 11))).toEqual([]);
  });
});

describe('selectOlderSessionGroups', () => {
  it('groups older Alben by derived Session, newest Session and Album first', () => {
    const albums = [
      album('sitzung-2024', '2024-02-10', 8),
      album('sitzung-2026', '2026-02-14', 8),
      album('sitzung-2025', '2025-02-22', 8),
      album('umzug-2025', '2025-03-03', 8),
    ];

    const groups = selectOlderSessionGroups(albums, INSIDE_CURRENT_SESSION);

    expect(groups.map((group) => group.session.yearsLabel)).toEqual(['2024/25', '2023/24']);
    expect(groups[0]?.albums.map((grouped) => grouped.slug)).toEqual([
      'umzug-2025',
      'sitzung-2025',
    ]);
    expect(groups[1]?.albums.map((grouped) => grouped.slug)).toEqual(['sitzung-2024']);
  });

  it('is empty while every Album belongs to the running Session', () => {
    expect(
      selectOlderSessionGroups([album('sitzung', '2026-02-14', 8)], INSIDE_CURRENT_SESSION),
    ).toEqual([]);
  });
});

describe('countPhotos', () => {
  it('sums the photos across Alben', () => {
    expect(countPhotos([album('a', '2026-02-14', 12), album('b', '2026-02-16', 9)])).toBe(21);
  });

  it('counts nothing without Alben', () => {
    expect(countPhotos([])).toBe(0);
  });
});

describe('buildPhotoCountLabel', () => {
  it('keeps the German singular for a lone photo', () => {
    expect(buildPhotoCountLabel(1)).toBe('1 Foto');
  });

  it('uses the plural for everything else', () => {
    expect(buildPhotoCountLabel(0)).toBe('0 Fotos');
    expect(buildPhotoCountLabel(12)).toBe('12 Fotos');
  });
});

describe('buildAlbumMeta', () => {
  it('joins the long German date and the venue', () => {
    expect(buildAlbumMeta(album('sitzung', '2026-02-14', 8))).toBe('14. Februar 2026 · Festhalle');
  });
});

describe('buildFeaturedAlbumMeta', () => {
  it('joins date, venue and the derived photo count', () => {
    expect(buildFeaturedAlbumMeta(album('umzug', '2026-02-16', 11))).toBe(
      '16. Februar 2026 · Festhalle · 11 Fotos',
    );
  });
});

describe('selectFeaturedAlbum', () => {
  it('features the newest Album by date', () => {
    const albums = [
      album('sitzung', '2026-02-14', 12),
      album('umzug', '2026-02-16', 11),
      album('eroeffnung', '2025-11-11', 8),
    ];

    expect(selectFeaturedAlbum(albums)?.slug).toBe('umzug');
  });

  it('features the newest seeded Album', () => {
    expect(selectFeaturedAlbum(ALBUMS)?.slug).toBe('rosenmontagsumzug-2026');
  });

  it('features nothing without Alben', () => {
    expect(selectFeaturedAlbum([])).toBeUndefined();
  });
});

describe('excludeAlbum', () => {
  it('drops the featured Album from the list it would repeat in', () => {
    const albums = [album('umzug', '2026-02-16', 11), album('sitzung', '2026-02-14', 12)];

    expect(excludeAlbum(albums, selectFeaturedAlbum(albums)).map((rest) => rest.slug)).toEqual([
      'sitzung',
    ]);
  });

  it('keeps every Album when nothing is excluded', () => {
    const albums = [album('umzug', '2026-02-16', 11)];

    expect(excludeAlbum(albums, undefined)).toEqual(albums);
  });

  it('keeps the Alben of the running Session apart from the featured one', () => {
    const currentSessionAlbums = selectCurrentSessionAlbums(ALBUMS, INSIDE_CURRENT_SESSION);
    const rest = excludeAlbum(currentSessionAlbums, selectFeaturedAlbum(ALBUMS));

    expect(rest.map((remaining) => remaining.slug)).toEqual([
      'prunksitzung-2026',
      'kinderfasching-2026',
      'sessionseroeffnung-2025',
    ]);
  });
});

describe('buildAlbumHref', () => {
  it('addresses an Album below the Galerie', () => {
    expect(buildAlbumHref('prunksitzung-2026')).toBe('/gallery/prunksitzung-2026');
  });
});

describe('findAlbumBySlug', () => {
  it('finds a seeded Album and reports an unknown slug as missing', () => {
    expect(findAlbumBySlug(ALBUMS, 'prunksitzung-2026')?.title).toBe('Prunksitzung');
    expect(findAlbumBySlug(ALBUMS, 'gibt-es-nicht')).toBeUndefined();
  });
});

describe('buildGalleryStats', () => {
  it('derives Album count, photo count and the running Session', () => {
    const albums = [album('a', '2026-02-14', 12), album('b', '2025-03-03', 8)];

    expect(buildGalleryStats(albums, INSIDE_CURRENT_SESSION)).toEqual([
      { value: '2', label: 'Alben' },
      { value: '20', label: 'Fotos' },
      { value: '2025/26', label: 'Session' },
    ]);
  });
});
