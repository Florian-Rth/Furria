import { describe, expect, it } from 'vitest';
import type { FacetMeter } from './facet-fit';
import { fitFacetsOf } from './facet-fit';
import type { FacetPiece } from './facet-pieces';

const METER: FacetMeter = { widthOf: (text) => Array.from(text).length, iconWidth: 2 };

const piece = (
  lead: string,
  text: string,
  truncates = false,
  icon: 'key' | null = null,
): FacetPiece => ({ key: text, lead, text, icon, truncates });

const TRAINING = [piece('', 'als Trainerin'), piece(' · ', 'Sporthalle Am Ring', true, 'key')];

describe('fitFacetsOf', () => {
  it.each([
    { available: 40, fits: ['whole', 'whole'] },
    { available: 36, fits: ['whole', 'cut'] },
    { available: 29, fits: ['whole', 'drop'] },
    { available: 10, fits: ['drop', 'drop'] },
  ])('fits the facets of a run line into $available', ({ available, fits }) => {
    expect(fitFacetsOf(TRAINING, available, METER).map((fit) => fit.kind)).toEqual(fits);
  });

  it.each([
    { available: 22, cut: 'Festhalle Großfurra…' },
    { available: 15, cut: 'Festhalle…' },
  ])('cuts a facet after its longest whole words within $available', ({ available, cut }) => {
    expect(fitFacetsOf([piece('', 'Festhalle Großfurra Nord', true)], available, METER)).toEqual([
      { kind: 'cut', text: cut },
    ]);
  });

  it('never ends a cut on a short word', () => {
    expect(fitFacetsOf([piece('', 'Sporthalle Am Ring', true)], 16, METER)).toEqual([
      { kind: 'cut', text: 'Sporthalle…' },
    ]);
  });

  it.each([{ text: 'neu seit 30.9.', available: 13 }])(
    'keeps a facet that may not truncate whole or drops it: $text',
    ({ text, available }) => {
      expect(fitFacetsOf([piece('', text)], available, METER)).toEqual([{ kind: 'drop' }]);
    },
  );

  it('drops every facet after the one it cuts', () => {
    const pieces = [piece('', 'Festhalle Großfurra', true), piece(' · ', 'mit Elferrat')];

    expect(fitFacetsOf(pieces, 15, METER).map((fit) => fit.kind)).toEqual(['cut', 'drop']);
  });

  it('counts the key icon into the room a facet needs', () => {
    const keyed = [piece('', 'Vereinsraum', false, 'key')];

    expect(fitFacetsOf(keyed, 13, METER).map((fit) => fit.kind)).toEqual(['drop']);
    expect(fitFacetsOf(keyed, 14, METER).map((fit) => fit.kind)).toEqual(['whole']);
  });
});
