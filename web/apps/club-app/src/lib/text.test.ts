import { describe, expect, it } from 'vitest';
import { normalizeForSearch, toIndexLetter } from './text';

describe('toIndexLetter', () => {
  it.each([
    ['Brendel', 'B'],
    ['Österreicher', 'O'],
    ['Übelacker', 'U'],
    ['Ärtzel', 'A'],
    ['Ćosić', 'C'],
    ['ßeltsam', 'S'],
    ['  kühnel', 'K'],
    ['', '#'],
    ['   ', '#'],
    ['1899 Hoffenheim', '#'],
    ['Šimek', 'S'],
  ])('files %s under %s', (lastName, expected) => {
    expect(toIndexLetter(lastName)).toBe(expected);
  });
});

describe('normalizeForSearch', () => {
  it.each([
    ['Müller', 'muller'],
    ['muller', 'muller'],
    ['Großfurra', 'grossfurra'],
    ['GROSSFURRA', 'grossfurra'],
    ['Tanzgarde', 'tanzgarde'],
    ['Ćosić', 'cosic'],
    ['', ''],
  ])('folds %s to %s', (value, expected) => {
    expect(normalizeForSearch(value)).toBe(expected);
  });
});
