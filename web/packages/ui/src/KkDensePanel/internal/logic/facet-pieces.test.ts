import { describe, expect, it } from 'vitest';
import { facetPiecesOf } from './facet-pieces';

describe('facetPiecesOf', () => {
  it('renders nothing without meta', () => {
    expect(facetPiecesOf(undefined)).toEqual([]);
  });

  it('reads a plain string as one facet without a separator', () => {
    expect(facetPiecesOf('gestern')).toEqual([
      { key: '0:gestern', lead: '', text: 'gestern', icon: null, truncates: false },
    ]);
  });

  it('separates facets in the given order and keeps their icons and truncation', () => {
    const pieces = facetPiecesOf([
      { text: 'bis 21:00' },
      { text: 'Sporthalle', icon: 'key', truncates: true },
    ]);

    expect(
      pieces.map((piece) => [piece.lead === '', piece.text, piece.icon, piece.truncates]),
    ).toEqual([
      [true, 'bis 21:00', null, false],
      [false, 'Sporthalle', 'key', true],
    ]);
  });

  it.each([
    [[{ text: '' }, { text: 'Festhalle' }], [true]],
    [
      [{ text: 'mit Tanzgarde' }, { text: '' }, { text: 'Festhalle' }],
      [true, false],
    ],
    ['', []],
  ])('drops empty facets before placing separators in %j', (meta, leadsAreEmpty) => {
    expect(facetPiecesOf(meta).map((piece) => piece.lead === '')).toEqual(leadsAreEmpty);
  });
});
