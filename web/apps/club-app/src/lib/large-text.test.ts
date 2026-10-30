import { describe, expect, it } from 'vitest';
import { isLargeText } from './large-text';

describe('isLargeText', () => {
  it.each([
    [16, 390, false],
    [20, 390, false],
    [24, 390, true],
    [32, 1440, true],
    [16, 359, true],
    [16, 360, false],
  ])('root font %dpx at %dpx wide is large: %s', (font, width, expected) => {
    expect(isLargeText(font, width)).toBe(expected);
  });
});
