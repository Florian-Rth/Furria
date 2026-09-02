import { describe, expect, it } from 'vitest';
import type { Album } from './gallery-content';
import {
  albumPreviewPhotoCount,
  buildAlbumCountLabel,
  buildAlbumPhotoEntries,
  buildAlbumPreviewEntries,
  buildPhotoCountLabel,
  buildPhotoPlaceholderLabel,
  countPhotos,
  selectCurrentSessionAlbums,
  selectNewestAlbumForEventType,
  selectNextAlbum,
  selectOlderSessionGroups,
  sortAlbumsByDateDesc,
} from './gallery-content';

const INSIDE_CURRENT_SESSION = new Date(2026, 6, 28);

const album = (slug: string, date: string, photoCount: number, eventType?: string): Album => ({
  slug,
  title: slug,
  date,
  venue: 'Festhalle',
  eventType,
  intro: 'Intro',
  photoCredit: 'Wegwerfkamera vom Kiosk',
  photos: Array.from({ length: photoCount }, (_, index) => ({
    orientation: index % 2 === 0 ? 'landscape' : 'portrait',
    alt: `Bild ${index + 1}`,
  })),
});

describe('sortAlbumsByDateDesc', () => {
  it('sorts a copy of the Alben, newest first', () => {
    const albums = [album('alt', '2026-01-10', 2), album('neu', '2026-02-14', 2)];

    expect(sortAlbumsByDateDesc(albums).map((entry) => entry.slug)).toEqual(['neu', 'alt']);
    expect(albums.map((entry) => entry.slug)).toEqual(['alt', 'neu']);
  });
});

describe('countPhotos', () => {
  it('sums the photos across every Album', () => {
    expect(countPhotos([album('a', '2026-01-10', 3), album('b', '2026-02-14', 4)])).toBe(7);
  });

  it('counts nothing without Alben', () => {
    expect(countPhotos([])).toBe(0);
  });
});

describe('buildPhotoCountLabel', () => {
  it('switches between the singular and the plural', () => {
    expect(buildPhotoCountLabel(1)).toBe('1 Foto');
    expect(buildPhotoCountLabel(2)).toBe('2 Fotos');
    expect(buildPhotoCountLabel(0)).toBe('0 Fotos');
  });
});

describe('buildAlbumCountLabel', () => {
  it('switches between the singular and the plural', () => {
    expect(buildAlbumCountLabel(1)).toBe('1 Album');
    expect(buildAlbumCountLabel(3)).toBe('3 Alben');
  });
});

describe('selectNextAlbum', () => {
  const albums = [
    album('erstes', '2026-01-10', 2),
    album('zweites', '2026-02-14', 2),
    album('drittes', '2026-03-01', 2),
  ];

  it('walks to the next older Album', () => {
    expect(selectNextAlbum(albums, 'drittes')?.slug).toBe('zweites');
  });

  it('wraps from the oldest Album back to the newest', () => {
    expect(selectNextAlbum(albums, 'erstes')?.slug).toBe('drittes');
  });

  it('has no next Album for an unknown slug or a lone Album', () => {
    expect(selectNextAlbum(albums, 'gibt-es-nicht')).toBeUndefined();
    expect(selectNextAlbum([album('einzeln', '2026-01-10', 2)], 'einzeln')).toBeUndefined();
  });
});

describe('selectNewestAlbumForEventType', () => {
  it('takes the newest Album of the matching Veranstaltungsart', () => {
    const albums = [
      album('sitzung-alt', '2026-01-10', 2, 'Prunksitzung'),
      album('sitzung-neu', '2026-02-14', 2, 'Prunksitzung'),
      album('umzug', '2026-03-01', 2, 'Umzug'),
    ];

    expect(selectNewestAlbumForEventType(albums, 'Prunksitzung')?.slug).toBe('sitzung-neu');
    expect(selectNewestAlbumForEventType(albums, 'Ordensfest')).toBeUndefined();
  });
});

describe('selectCurrentSessionAlbums', () => {
  it('keeps only the Alben of the open Session, newest first', () => {
    const albums = [
      album('vorsession', '2025-02-10', 2),
      album('session-frueh', '2025-12-20', 2),
      album('session-spaet', '2026-02-14', 2),
    ];

    expect(
      selectCurrentSessionAlbums(albums, INSIDE_CURRENT_SESSION).map((entry) => entry.slug),
    ).toEqual(['session-spaet', 'session-frueh']);
  });
});

describe('selectOlderSessionGroups', () => {
  it('groups the older Alben per Session, newest Session first', () => {
    const albums = [
      album('sehr-alt', '2024-02-05', 2),
      album('alt-frueh', '2025-01-10', 2),
      album('alt-spaet', '2025-02-20', 2),
      album('offen', '2026-02-14', 2),
    ];

    const groups = selectOlderSessionGroups(albums, INSIDE_CURRENT_SESSION);

    expect(groups.map((group) => group.session.yearsLabel)).toEqual(['2024/25', '2023/24']);
    expect(groups[0]?.albums.map((entry) => entry.slug)).toEqual(['alt-spaet', 'alt-frueh']);
  });

  it('leaves the open Session out and has nothing to group without older Alben', () => {
    expect(
      selectOlderSessionGroups([album('offen', '2026-02-14', 2)], INSIDE_CURRENT_SESSION),
    ).toEqual([]);
  });
});

describe('buildPhotoPlaceholderLabel', () => {
  it('numbers the photos from one, zero-padded to two digits', () => {
    const seeded = album('prunksitzung', '2026-02-14', 12);

    expect(buildPhotoPlaceholderLabel(seeded, 0)).toBe('prunksitzung-01');
    expect(buildPhotoPlaceholderLabel(seeded, 11)).toBe('prunksitzung-12');
  });
});

describe('buildAlbumPhotoEntries', () => {
  it('pairs every photo with its own index and placeholder label', () => {
    const entries = buildAlbumPhotoEntries(album('umzug', '2026-02-14', 3));

    expect(entries.map((entry) => entry.index)).toEqual([0, 1, 2]);
    expect(entries.map((entry) => entry.placeholderLabel)).toEqual([
      'umzug-01',
      'umzug-02',
      'umzug-03',
    ]);
  });
});

describe('buildAlbumPreviewEntries', () => {
  it('caps the preview at the preview photo count', () => {
    expect(buildAlbumPreviewEntries(album('umzug', '2026-02-14', 12))).toHaveLength(
      albumPreviewPhotoCount,
    );
  });

  it('shows fewer photos instead of padding a short Album', () => {
    expect(buildAlbumPreviewEntries(album('umzug', '2026-02-14', 2))).toHaveLength(2);
  });
});
