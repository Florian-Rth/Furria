import { describe, expect, it } from 'vitest';
import { toSealScale } from './seal-scale';

describe('toSealScale', () => {
  it.each([
    [88, { dateLabel: 'h1', caption: 'caption' }],
    [139, { dateLabel: 'h1', caption: 'caption' }],
    [140, { dateLabel: 'display', caption: 'body2' }],
    [168, { dateLabel: 'display', caption: 'body2' }],
  ])('scales the texts of a %ipx seal', (size, scale) => {
    expect(toSealScale(size)).toEqual(scale);
  });
});
