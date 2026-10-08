import { describe, expect, it } from 'vitest';
import { toQrPath } from './qr-modules';

describe('toQrPath', () => {
  it.each<[string, boolean[][], string]>([
    ['an all-light matrix', [[false, false]], ''],
    ['a single dark module', [[true]], 'M0 0h1v1h-1z'],
    [
      'a diagonal',
      [
        [true, false],
        [false, true],
      ],
      'M0 0h1v1h-1zM1 1h1v1h-1z',
    ],
  ])('draws %s', (_case, modules, expected) => {
    expect(toQrPath(modules)).toBe(expected);
  });
});
