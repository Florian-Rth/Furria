import { describe, expect, it } from 'vitest';
import type { MeRelevantSession } from '@/lib/api/schemas';
import { lapClosingAt } from './greeting-lap';

describe('lapClosingAt', () => {
  it.each<[string, Date, MeRelevantSession | null, number | null]>([
    [
      'closes the lap on the opening day',
      new Date(2026, 10, 11, 9, 30),
      { startYear: 2026, ordinal: 22 },
      22,
    ],
    [
      'keeps the closing for thirty days',
      new Date(2026, 11, 11, 23, 0),
      { startYear: 2026, ordinal: 5 },
      5,
    ],
    [
      'ends the closing after thirty days',
      new Date(2026, 11, 12, 0, 30),
      { startYear: 2026, ordinal: 5 },
      null,
    ],
    [
      'waits for the opening of the coming session',
      new Date(2026, 10, 10, 20, 0),
      { startYear: 2026, ordinal: 11 },
      null,
    ],
    [
      'closes nothing in a session inside a lap',
      new Date(2026, 10, 20, 9, 30),
      { startYear: 2026, ordinal: 12 },
      null,
    ],
    ['closes nothing without a running membership', new Date(2026, 10, 20, 9, 30), null, null],
    [
      'closes the brilliant lap at fifty-five',
      new Date(2026, 10, 20, 9, 30),
      { startYear: 2026, ordinal: 55 },
      55,
    ],
    [
      'closes nothing past fifty-five',
      new Date(2026, 10, 20, 9, 30),
      { startYear: 2026, ordinal: 56 },
      null,
    ],
  ])('%s', (_label, now, session, expected) => {
    expect(lapClosingAt(now, session)).toBe(expected);
  });
});
