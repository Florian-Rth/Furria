import { cutClockOf, fineClockOf, offsetTextOf, spotMetaOf } from '@furria/studio/studio-copy';
import { describe, expect, it } from 'vitest';

describe('time formatters', () => {
  it.each([
    [15.238, '0:15,2'],
    [61.96, '1:02,0'],
    [-0.25, '-0:00,3'],
  ])('fineClockOf(%s)', (seconds, text) => {
    expect(fineClockOf(seconds)).toBe(text);
  });

  it.each([
    [0.2, '+0,20 s'],
    [-0.05, '−0,05 s'],
    [0, '±0,00 s'],
  ])('offsetTextOf(%s)', (seconds, text) => {
    expect(offsetTextOf(seconds)).toBe(text);
  });

  it.each([
    [15.238, '0:15,24'],
    [61.996, '1:02,00'],
    [119.994, '1:59,99'],
    [0.004, '0:00,00'],
    [-1, '0:00,00'],
  ])('cutClockOf(%s)', (seconds, text) => {
    expect(cutClockOf(seconds)).toBe(text);
  });
});

describe('spotMetaOf', () => {
  it.each([
    [0, 'Mitte · 2,0 m hinten · 0 Wegpunkte'],
    [1, 'Mitte · 2,0 m hinten · 1 Wegpunkt'],
    [3, 'Mitte · 2,0 m hinten · 3 Wegpunkte'],
  ])('counts %s waypoints', (keys, text) => {
    expect(spotMetaOf(0, 2, keys)).toBe(text);
  });
});
