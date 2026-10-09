import { describe, expect, it } from 'vitest';
import { AlbumDetailSchema, GalleryResponseSchema } from './schemas';

const photo = (width: number, height: number) => ({
  mediaItemId: 7,
  width,
  height,
  smallUrl: '/api/public/gallery/photos/7/small',
  mediumUrl: '/api/public/gallery/photos/7/medium',
  largeUrl: '/api/public/gallery/photos/7/large',
});

describe('AlbumDetailSchema', () => {
  it('reads the entry as Berlin wall-clock time, the session and the description paragraphs', () => {
    const album = AlbumDetailSchema.parse({
      albumId: 4,
      title: 'Prunksitzung',
      description: 'Erster.\n\nZweiter.',
      entryStartsAt: '2026-02-14T18:11:00+00:00',
      sessionStartYear: 2025,
      sessionNumber: 67,
      photos: [{ ...photo(1200, 1600), caption: null }],
    });

    expect([album.entryStartsAt, album.session, album.paragraphs]).toEqual([
      '2026-02-14T19:11',
      { startYear: 2025, yearsLabel: '2025/26', number: 67 },
      ['Erster.', 'Zweiter.'],
    ]);
  });

  it.each([
    [1200, 1600, 'portrait'],
    [1600, 1200, 'landscape'],
    [1600, 1600, 'landscape'],
  ])('orients a %ix%i photo as %s', (width, height, orientation) => {
    const album = AlbumDetailSchema.parse({
      albumId: 4,
      title: 'Prunksitzung',
      description: null,
      entryStartsAt: null,
      sessionStartYear: 2025,
      sessionNumber: null,
      photos: [{ ...photo(width, height), caption: null }],
    });

    expect(album.photos[0]?.orientation).toBe(orientation);
  });
});

describe('GalleryResponseSchema', () => {
  it('hands every album its session', () => {
    const gallery = GalleryResponseSchema.parse({
      sessions: [
        {
          sessionStartYear: 2024,
          sessionNumber: null,
          albums: [
            {
              albumId: 2,
              title: 'Umzug',
              entryStartsAt: null,
              photoCount: 3,
              cover: photo(1600, 1200),
            },
          ],
        },
      ],
    });

    expect(gallery.sessions[0]?.albums[0]?.session).toEqual({
      startYear: 2024,
      yearsLabel: '2024/25',
      number: null,
    });
  });
});
