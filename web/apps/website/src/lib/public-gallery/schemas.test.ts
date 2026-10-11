import { describe, expect, it } from 'vitest';
import { AlbumDetailSchema, GalleryResponseSchema } from './schemas';

const photo = (width: number, height: number) => ({
  mediaItemId: 7,
  width,
  height,
  smallUrl: '/api/public/gallery/pictures/7/small',
  mediumUrl: '/api/public/gallery/pictures/7/medium',
  largeUrl: '/api/public/gallery/pictures/7/large',
});

describe('AlbumDetailSchema', () => {
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
