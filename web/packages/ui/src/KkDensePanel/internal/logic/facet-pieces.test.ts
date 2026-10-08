import { describe, expect, it } from 'vitest';
import { facetPiecesOf } from './facet-pieces';

describe('facetPiecesOf', () => {
  it('separates facets in the given order and keeps their icons and truncation', () => {
    const pieces = facetPiecesOf([{ text: 'a' }, { text: 'b', icon: 'key', truncates: true }]);

    expect(
      pieces.map((piece) => [piece.lead === '', piece.text, piece.icon, piece.truncates]),
    ).toEqual([
      [true, 'a', null, false],
      [false, 'b', 'key', true],
    ]);
  });

  it.each([
    [
      [{ text: 'a' }, { text: '' }, { text: 'b' }],
      [true, false],
    ],
    [[{ text: '' }, { text: 'b' }], [true]],
    ['', []],
  ])('drops empty facets before placing separators in %j', (meta, leadsAreEmpty) => {
    expect(facetPiecesOf(meta).map((piece) => piece.lead === '')).toEqual(leadsAreEmpty);
  });
});
