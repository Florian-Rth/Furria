import { describe, expect, it } from 'vitest';
import { contrastOf, hexOfHsv, hexOfOklch, hsvOfHex, oklchOf, toToneHex } from './tone-color';

describe('toToneHex', () => {
  it.each([
    ['#12ab9c', '#12AB9C'],
    ['12AB9C', '#12AB9C'],
    [' #12AB9C ', '#12AB9C'],
    ['#12AB9', null],
    ['#GGGGGG', null],
    ['', null],
  ])('reads %j as %j', (value, expected) => {
    expect(toToneHex(value)).toBe(expected);
  });
});

describe('contrastOf', () => {
  it.each([
    ['#FFFFFF', '#000000', 21],
    ['#777777', '#FFFFFF', 4.48],
    ['#FFFFFF', '#FFFFFF', 1],
  ])('measures %s against %s', (first, second, expected) => {
    expect(contrastOf(first, second)).toBeCloseTo(expected, 2);
  });
});

describe('colour round trips', () => {
  it.each(['#A0522B', '#12AB9C', '#FFEB3B', '#000000', '#FFFFFF', '#808080'])(
    'keeps %s through oklch and hsv',
    (hex) => {
      expect(hexOfOklch(oklchOf(hex))).toBe(hex);
      expect(hexOfHsv(hsvOfHex(hex))).toBe(hex);
    },
  );

  it.each([
    ['#FF0000', { h: 0, s: 1, v: 1 }],
    ['#00FF00', { h: 120, s: 1, v: 1 }],
    ['#0000FF', { h: 240, s: 1, v: 1 }],
    ['#808080', { h: 0, s: 0, v: 128 / 255 }],
  ])('reads %s as hue, saturation and brightness', (hex, expected) => {
    expect(hsvOfHex(hex)).toEqual(expected);
  });
});
