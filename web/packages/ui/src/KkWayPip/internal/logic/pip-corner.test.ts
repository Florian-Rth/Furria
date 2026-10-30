import { describe, expect, it } from 'vitest';
import { isTap, nearestCornerOf } from './pip-corner';

describe('nearestCornerOf', () => {
  it.each([
    [0.1, 0.1, 'topLeft'],
    [0.9, 0.1, 'topRight'],
    [0.2, 0.8, 'bottomLeft'],
    [0.6, 0.6, 'bottomRight'],
  ])('a picture let go at %s × %s docks %s', (x, y, corner) => {
    expect(nearestCornerOf(x, y)).toBe(corner);
  });
});

describe('isTap', () => {
  it.each([
    [0, 0, true],
    [3, 4, true],
    [6, 6, false],
  ])('a travel of %s × %s px is a tap: %s', (dx, dy, tap) => {
    expect(isTap(dx, dy)).toBe(tap);
  });
});
