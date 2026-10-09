import { describe, expect, it } from 'vitest';
import { clockLabel, dayLabel, durationLabel, sceneSpanLabel, sessionLabel } from './gallery-view';

describe('sessionLabel', () => {
  it.each([
    [2025, '2025/26'],
    [2099, '2099/00'],
    [2008, '2008/09'],
  ])('formats %i', (startYear, expected) => {
    expect(sessionLabel(startYear)).toBe(expected);
  });
});

describe('durationLabel', () => {
  it.each<[number | null, string | undefined]>([
    [null, undefined],
    [4.4, '0:04'],
    [59.6, '1:00'],
    [754, '12:34'],
  ])('formats %s seconds', (seconds, expected) => {
    expect(durationLabel(seconds)).toBe(expected);
  });
});

describe('dayLabel', () => {
  it.each<[string | null, string | null]>([
    [null, null],
    ['2026-10-03T17:00:00Z', '03.10.'],
  ])('formats %s', (instant, expected) => {
    expect(dayLabel(instant)).toBe(expected);
  });
});

describe('sceneSpanLabel', () => {
  const sceneOf = (startsAt: string | null, endsAt: string | null) => ({
    index: 1,
    firstNumber: 4,
    lastNumber: 9,
    startsAt,
    endsAt,
    frames: [],
  });

  it.each<[string, string | null, string | null, string]>([
    ['an untimed scene counts its frames', null, null, 'Bild 4–9'],
    [
      'an untimed end keeps the start alone',
      '2026-10-03T20:47:00Z',
      null,
      clockLabel('2026-10-03T20:47:00Z'),
    ],
    [
      'a timed scene spans start to end',
      '2026-10-03T20:47:00Z',
      '2026-10-03T20:59:00Z',
      `${clockLabel('2026-10-03T20:47:00Z')}–${clockLabel('2026-10-03T20:59:00Z')}`,
    ],
  ])('%s', (_, startsAt, endsAt, expected) => {
    expect(sceneSpanLabel(sceneOf(startsAt, endsAt))).toBe(expected);
  });
});
