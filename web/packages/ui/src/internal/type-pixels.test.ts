import { describe, expect, it } from 'vitest';
import { typePixelsOf } from './type-pixels';

describe('typePixelsOf', () => {
  it.each<[string, string | number | undefined, number | undefined, number]>([
    ['keeps a pixel number', 20, 32, 20],
    ['reads a pixel string', '18px', 32, 18],
    ['reads rem at the default root size', '2rem', undefined, 32],
    ['reads rem at an enlarged root size', '2rem', 32, 64],
    ['falls back to one rem without a size', undefined, 24, 24],
  ])('%s', (_, size, remPixels, expected) => {
    expect(typePixelsOf(size, remPixels)).toBe(expected);
  });
});
