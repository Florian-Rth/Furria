import { describe, expect, it } from 'vitest';
import { photoColumnsOf } from './photo-columns';

describe('photoColumnsOf', () => {
  it('deals photos across the columns row by row and repeats them when few', () => {
    const columns = photoColumnsOf(['a.jpg', 'b.jpg'], 3);

    expect(columns.map((column) => column.photos.map((photo) => photo.src))).toEqual([
      ['a.jpg', 'b.jpg', 'a.jpg', 'b.jpg'],
      ['b.jpg', 'a.jpg', 'b.jpg', 'a.jpg'],
      ['a.jpg', 'b.jpg', 'a.jpg', 'b.jpg'],
    ]);
  });

  it('leaves every print empty when there are no photos yet', () => {
    const sources = photoColumnsOf([], 2).flatMap((column) =>
      column.photos.map((photo) => photo.src),
    );

    expect(sources).toEqual([null, null, null, null, null, null, null, null]);
  });
});
