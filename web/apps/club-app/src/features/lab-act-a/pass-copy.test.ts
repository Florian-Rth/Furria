import { describe, expect, it } from 'vitest';
import { toEveningStamp, toPlaceLabel, toSilentPracticeHint, toTally } from './pass-copy';

describe('toPlaceLabel', () => {
  it.each([
    [null, null, 'noch offen'],
    [3, null, 'Nr. 4'],
    [0, '2026-10-30T16:25:00+00:00', 'Nr. 1 · 17:25'],
    [3, '2026-10-30T16:36:31+00:00', 'Nr. 4 · ca. 17:35'],
  ])('position %s at %s → %s', (position, stageStartsAt, expected) => {
    expect(toPlaceLabel(position, stageStartsAt)).toBe(expected);
  });
});

describe('toEveningStamp', () => {
  it.each([
    [null, 'offen'],
    [4, 'Nr. 5'],
  ])('%s → %s', (position, expected) => {
    expect(toEveningStamp(position)).toBe(expected);
  });
});

describe('toSilentPracticeHint', () => {
  it.each([
    [[], 'Noch keine Musik.'],
    [['Sophie'], 'Noch keine Musik — frag Sophie.'],
    [['Thomas', 'Florian'], 'Noch keine Musik — frag Thomas oder Florian.'],
    [['A', 'B', 'C'], 'Noch keine Musik — frag A, B oder C.'],
  ])('%o → %s', (names, expected) => {
    expect(toSilentPracticeHint(names)).toBe(expected);
  });
});

describe('toTally', () => {
  it.each([
    [0, 0, 'noch keine Antworten'],
    [3, 1, '3 da · 1 nicht'],
  ])('%s / %s → %s', (present, absent, expected) => {
    expect(toTally(present, absent)).toBe(expected);
  });
});
