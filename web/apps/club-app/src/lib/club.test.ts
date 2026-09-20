import { describe, expect, it } from 'vitest';
import {
  ashWednesdayOf,
  daysUntilOpening,
  isBetweenSessions,
  mottoStageStateAt,
  relevantSessionYear,
  sessionAt,
  sessionClosingAt,
  sessionOpeningAt,
  sessionProgressAt,
} from './club';

describe('sessionAt', () => {
  it('stays in the running session while the opening is still ahead', () => {
    expect(sessionAt(new Date(2026, 6, 21))).toEqual({
      startYear: 2025,
      yearsLabel: '2025/26',
    });
  });

  it('stays in the running session on the day before the opening', () => {
    expect(sessionAt(new Date(2026, 10, 10)).yearsLabel).toBe('2025/26');
  });

  it('switches to the new session on the opening day itself', () => {
    expect(sessionAt(new Date(2026, 10, 11))).toEqual({
      startYear: 2026,
      yearsLabel: '2026/27',
    });
  });

  it('switches on the first day of the month after the opening month', () => {
    expect(sessionAt(new Date(2026, 11, 1)).yearsLabel).toBe('2026/27');
  });

  it('keeps the session across the calendar year change', () => {
    expect(sessionAt(new Date(2027, 1, 14)).yearsLabel).toBe('2026/27');
  });

  it('pads the label across a century boundary', () => {
    expect(sessionAt(new Date(2099, 11, 31)).yearsLabel).toBe('2099/00');
  });
});

describe('ashWednesdayOf', () => {
  it.each([
    { year: 2024, month: 1, day: 14 },
    { year: 2025, month: 2, day: 5 },
    { year: 2026, month: 1, day: 18 },
    { year: 2027, month: 1, day: 10 },
    { year: 2028, month: 2, day: 1 },
    { year: 2038, month: 2, day: 10 },
  ])('falls on $day.$month. in $year', ({ year, month, day }) => {
    expect(ashWednesdayOf(year)).toEqual(new Date(year, month, day));
  });
});

describe('sessionProgressAt', () => {
  it('starts at nothing on the Eröffnung', () => {
    expect(sessionProgressAt(new Date(2025, 10, 11))).toBe(0);
  });

  it('is under way in the middle of the Session', () => {
    const progress = sessionProgressAt(new Date(2026, 0, 1));

    expect(progress).toBeGreaterThan(0.5);
    expect(progress).toBeLessThan(0.75);
  });

  it('still runs on Aschermittwoch itself', () => {
    const progress = sessionProgressAt(new Date(2026, 1, 18, 12));

    expect(progress).toBeGreaterThan(0.9);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it('has nothing left to watch once Aschermittwoch is over', () => {
    expect(sessionProgressAt(new Date(2026, 1, 19))).toBeNull();
  });

  it('has nothing to watch in the summer between two Sessions', () => {
    expect(sessionProgressAt(new Date(2026, 6, 21))).toBeNull();
  });

  it('starts over with the next Eröffnung', () => {
    expect(sessionProgressAt(new Date(2026, 10, 11))).toBe(0);
  });
});

describe('sessionOpeningAt', () => {
  it.each([
    { startYear: 2025, expected: new Date(2025, 10, 11, 11, 11) },
    { startYear: 2026, expected: new Date(2026, 10, 11, 11, 11) },
    { startYear: 2027, expected: new Date(2027, 10, 11, 11, 11) },
  ])('opens the $startYear session on 11.11. at 11:11', ({ startYear, expected }) => {
    expect(sessionOpeningAt(startYear)).toEqual(expected);
  });
});

describe('sessionClosingAt', () => {
  it.each([
    { startYear: 2023, expected: new Date(2024, 1, 15) },
    { startYear: 2024, expected: new Date(2025, 2, 6) },
    { startYear: 2025, expected: new Date(2026, 1, 19) },
    { startYear: 2026, expected: new Date(2027, 1, 11) },
    { startYear: 2027, expected: new Date(2028, 2, 2) },
  ])('closes the $startYear session the day after Aschermittwoch', ({ startYear, expected }) => {
    expect(sessionClosingAt(startYear)).toEqual(expected);
  });
});

describe('isBetweenSessions', () => {
  it.each([
    { label: 'Aschermittwoch itself', date: new Date(2026, 1, 18, 12), expected: false },
    { label: 'the day after Aschermittwoch', date: new Date(2026, 1, 19), expected: true },
    { label: 'high summer', date: new Date(2026, 6, 21), expected: true },
    { label: 'the eve of the Eröffnung', date: new Date(2026, 10, 10, 23, 59), expected: true },
    { label: 'midnight on 11.11.', date: new Date(2026, 10, 11, 0, 0), expected: false },
    { label: 'the turn of the year', date: new Date(2027, 0, 5), expected: false },
  ])('is $expected on $label', ({ date, expected }) => {
    expect(isBetweenSessions(date)).toBe(expected);
  });
});

describe('relevantSessionYear', () => {
  it.each([
    { label: 'Aschermittwoch itself', date: new Date(2026, 1, 18, 12), expected: 2025 },
    { label: 'the day after Aschermittwoch', date: new Date(2026, 1, 19), expected: 2026 },
    { label: 'high summer', date: new Date(2026, 6, 21), expected: 2026 },
    { label: 'the eve of the Eröffnung', date: new Date(2026, 10, 10, 23, 59), expected: 2026 },
    { label: 'midnight on 11.11.', date: new Date(2026, 10, 11, 0, 0), expected: 2026 },
    { label: 'the turn of the year', date: new Date(2027, 0, 5), expected: 2026 },
  ])('looks at $expected on $label', ({ date, expected }) => {
    expect(relevantSessionYear(date)).toBe(expected);
  });
});

describe('mottoStageStateAt', () => {
  it.each([
    {
      label: 'the stroke of 11:11',
      date: new Date(2026, 10, 11, 11, 11),
      known: true,
      expected: 'running',
    },
    {
      label: 'the stroke of 11:11 without a Motto',
      date: new Date(2026, 10, 11, 11, 11),
      known: false,
      expected: 'running',
    },
    {
      label: 'the minute before 11:11',
      date: new Date(2026, 10, 11, 11, 10),
      known: true,
      expected: 'teaser',
    },
    {
      label: 'the minute before 11:11 without a Motto',
      date: new Date(2026, 10, 11, 11, 10),
      known: false,
      expected: 'resting',
    },
    {
      label: 'the middle of the Session',
      date: new Date(2027, 0, 5),
      known: true,
      expected: 'running',
    },
    {
      label: 'the day the Session closed',
      date: new Date(2027, 1, 11),
      known: true,
      expected: 'teaser',
    },
    {
      label: 'high summer with a Motto',
      date: new Date(2026, 6, 21),
      known: true,
      expected: 'teaser',
    },
    {
      label: 'high summer without a Motto',
      date: new Date(2026, 6, 21),
      known: false,
      expected: 'resting',
    },
  ])('is $expected at $label', ({ date, known, expected }) => {
    expect(mottoStageStateAt(date, 2026, known)).toBe(expected);
  });
});

describe('daysUntilOpening', () => {
  it.each([
    { label: 'late on 11.11.', date: new Date(2026, 10, 11, 23, 30), startYear: 2026, expected: 0 },
    {
      label: 'midnight on 11.11.',
      date: new Date(2026, 10, 11, 0, 0),
      startYear: 2026,
      expected: 0,
    },
    {
      label: 'a minute before midnight on 10.11.',
      date: new Date(2026, 10, 10, 23, 59),
      startYear: 2026,
      expected: 1,
    },
    {
      label: 'two mornings before',
      date: new Date(2026, 10, 9, 8, 0),
      startYear: 2026,
      expected: 2,
    },
    {
      label: 'across the end of summer time',
      date: new Date(2026, 9, 20, 12, 0),
      startYear: 2026,
      expected: 22,
    },
    {
      label: 'a whole Zwischenzeit away',
      date: new Date(2026, 8, 20, 0, 0),
      startYear: 2026,
      expected: 52,
    },
    {
      label: 'across both clock changes',
      date: new Date(2027, 1, 20, 0, 0),
      startYear: 2027,
      expected: 264,
    },
  ])('counts $expected whole days $label', ({ date, startYear, expected }) => {
    expect(daysUntilOpening(date, startYear)).toBe(expected);
  });
});

describe('the midnight label flip against the sealed Bühne', () => {
  it.each([
    {
      label: 'the eve of the Eröffnung',
      date: new Date(2026, 10, 10, 23, 59),
      yearsLabel: '2025/26',
      state: 'teaser',
      days: 1,
    },
    {
      label: 'midnight on 11.11.',
      date: new Date(2026, 10, 11, 0, 0),
      yearsLabel: '2026/27',
      state: 'teaser',
      days: 0,
    },
    {
      label: 'the stroke of 11:11',
      date: new Date(2026, 10, 11, 11, 11),
      yearsLabel: '2026/27',
      state: 'running',
      days: 0,
    },
  ])('reads $yearsLabel and stands $state at $label', ({ date, yearsLabel, state, days }) => {
    const relevantStartYear = relevantSessionYear(date);

    expect(sessionAt(date).yearsLabel).toBe(yearsLabel);
    expect(relevantStartYear).toBe(2026);
    expect(mottoStageStateAt(date, relevantStartYear, true)).toBe(state);
    expect(daysUntilOpening(date, relevantStartYear)).toBe(days);
  });

  it('has barely begun when the Session opens', () => {
    const progress = sessionProgressAt(new Date(2026, 10, 11, 11, 11));

    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(0.01);
  });
});
