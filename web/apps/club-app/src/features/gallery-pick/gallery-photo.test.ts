import { describe, expect, it } from 'vitest';
import { pickableAlbumsOf } from './gallery-photo';

describe('pickableAlbumsOf', () => {
  it('offers the albums of every session in order, leaving out those without photos', () => {
    const albums = pickableAlbumsOf({
      sections: [
        {
          albums: [
            { albumId: 1, title: 'Prunksitzung', photos: 40 },
            { albumId: 2, title: 'Nur Videos', photos: 0 },
          ],
        },
        { albums: [{ albumId: 3, title: 'Umzug', photos: 12 }] },
      ],
    });

    expect(albums.map((album) => album.albumId)).toEqual([1, 3]);
  });
});
