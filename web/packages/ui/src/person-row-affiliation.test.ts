import { describe, expect, it } from 'vitest';
import { resolvePersonRowAffiliation } from './person-row-affiliation';

describe('resolvePersonRowAffiliation', () => {
  it('keeps the accent first and folds the separator into the meta half', () => {
    expect(
      resolvePersonRowAffiliation({ accent: 'Sitzungspräsidentin', meta: 'Tanzgarde' }),
    ).toEqual({
      accent: 'Sitzungspräsidentin',
      meta: ' · Tanzgarde',
      empty: null,
      present: true,
    });
  });

  it('renders a lone half without a dangling separator', () => {
    expect(resolvePersonRowAffiliation({ accent: 'Elferrat' }).meta).toBeNull();
    expect(resolvePersonRowAffiliation({ meta: 'Tanzgarde · Elferrat' })).toEqual({
      accent: null,
      meta: 'Tanzgarde · Elferrat',
      empty: null,
      present: true,
    });
  });

  it('falls back to the empty line only when both halves are missing', () => {
    expect(resolvePersonRowAffiliation({ emptyMeta: 'keine Gruppe' })).toEqual({
      accent: null,
      meta: null,
      empty: 'keine Gruppe',
      present: true,
    });
    expect(
      resolvePersonRowAffiliation({ meta: 'Kindergarde', emptyMeta: 'keine Gruppe' }).empty,
    ).toBeNull();
  });

  it('treats blank strings as absent so a padded value never claims a line', () => {
    expect(resolvePersonRowAffiliation({ accent: '   ', meta: '' })).toEqual({
      accent: null,
      meta: null,
      empty: null,
      present: false,
    });
    expect(resolvePersonRowAffiliation({ accent: '  Kommandantin  ' }).accent).toBe('Kommandantin');
  });

  it('reports no line at all when nothing was passed', () => {
    expect(resolvePersonRowAffiliation({}).present).toBe(false);
  });
});
