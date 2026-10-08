import { describe, expect, it } from 'vitest';
import { normalizeForSearch, toIndexLetter } from './text';

describe('toIndexLetter', () => {
  it.each([
    ['Österreicher', 'O'],
    ['Ćosić', 'C'],
    ['ßeltsam', 'S'],
    ['  kühnel', 'K'],
    ['', '#'],
    ['1899 Hoffenheim', '#'],
  ])('files %s under %s', (lastName, expected) => {
    expect(toIndexLetter(lastName)).toBe(expected);
  });
});

describe('normalizeForSearch', () => {
  it.each([
    ['Müller', 'muller'],
    ['Großfurra', 'grossfurra'],
    ['Ćosić', 'cosic'],
  ])('folds %s to %s', (value, expected) => {
    expect(normalizeForSearch(value)).toBe(expected);
  });
});
