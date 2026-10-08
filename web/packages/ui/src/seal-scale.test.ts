import { describe, expect, it } from 'vitest';
import { toSealScale } from './seal-scale';

describe('toSealScale', () => {
  it.each([
    [139, 'h1'],
    [140, 'display'],
  ])('scales the date of a %ipx seal to %s', (size, dateLabel) => {
    expect(toSealScale(size).dateLabel).toBe(dateLabel);
  });
});
