import { describe, expect, it } from 'vitest';
import { metresText, offsetText, timeText } from './studio-i-copy';

describe('timeText', () => {
  it.each([
    [0, '0:00,0'],
    [30.476, '0:30,5'],
    [61.96, '1:02,0'],
  ] as const)('%d s → %s', (seconds, expected) => {
    expect(timeText(seconds)).toBe(expected);
  });
});

describe('offsetText', () => {
  it.each([
    [0, '+0,00 s'],
    [0.04, '+0,04 s'],
    [-0.12, '−0,12 s'],
  ] as const)('%d → %s', (shift, expected) => {
    expect(offsetText(shift)).toBe(expected);
  });
});

describe('metresText', () => {
  it.each([
    [{ rightMetres: -1.5, backMetres: 2 }, '1,50 m links · 2,00 m hinten'],
    [{ rightMetres: 0, backMetres: 0.25 }, 'Mitte · 0,25 m hinten'],
  ] as const)('%o → %s', (point, expected) => {
    expect(metresText(point)).toBe(expected);
  });
});
