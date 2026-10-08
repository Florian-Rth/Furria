import { describe, expect, it } from 'vitest';
import type { GreetingViewer } from './greeting-act';
import { greetingActAt, seasonClauseAt } from './greeting-act';

interface ViewerCase {
  label: string;
  now: Date;
  overrides: Partial<GreetingViewer>;
}

interface MomentCase extends ViewerCase {
  expected: object;
}

interface FestiveCase extends ViewerCase {
  expected: boolean;
}

const viewer = (overrides: Partial<GreetingViewer> = {}): GreetingViewer => ({
  birthDate: '1996-03-12',
  membershipState: 'active',
  memberSince: '2015-06-17',
  relevantSession: null,
  appSince: null,
  ...overrides,
});

describe('seasonClauseAt', () => {
  it.each([
    {
      label: 'an autumn day between sessions',
      now: new Date(2026, 9, 2, 12, 0),
      expected: { kind: 'untilOpening', days: 40 },
    },
    {
      label: 'two days before the opening',
      now: new Date(2026, 10, 9, 23, 59),
      expected: { kind: 'untilOpening', days: 2 },
    },
    {
      label: 'the eve of the opening',
      now: new Date(2026, 10, 10, 0, 0),
      expected: { kind: 'openingTomorrow' },
    },
    {
      label: 'the morning of 11.11.',
      now: new Date(2026, 10, 11, 8, 0),
      expected: { kind: 'openingToday' },
    },
    {
      label: 'the afternoon of 11.11.',
      now: new Date(2026, 10, 11, 15, 0),
      expected: { kind: 'sessionDay', day: 1 },
    },
    {
      label: 'twelve days before Weiberfastnacht',
      now: new Date(2027, 0, 23, 12, 0),
      expected: { kind: 'sessionDay', day: 74 },
    },
    {
      label: 'eleven days before Weiberfastnacht',
      now: new Date(2027, 0, 24, 12, 0),
      expected: { kind: 'untilWomensCarnivalDay', days: 11 },
    },
    {
      label: 'the eve of Weiberfastnacht',
      now: new Date(2027, 1, 3, 23, 0),
      expected: { kind: 'untilWomensCarnivalDay', days: 1 },
    },
    {
      label: 'Weiberfastnacht itself',
      now: new Date(2027, 1, 4, 11, 11),
      expected: { kind: 'sessionDay', day: 86 },
    },
    {
      label: 'the day after Aschermittwoch',
      now: new Date(2027, 1, 11, 0, 0),
      expected: { kind: 'untilOpening', days: 273 },
    },
  ])('reads $expected.kind on $label', ({ now, expected }) => {
    expect(seasonClauseAt(now)).toEqual(expected);
  });
});

describe('greetingActAt', () => {
  it.each<MomentCase>([
    {
      label: 'an ordinary autumn day',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: {},
      expected: { moment: 'daily', clause: { kind: 'untilOpening', days: 40 } },
    },
    {
      label: 'the morning of 11.11.',
      now: new Date(2026, 10, 11, 8, 0),
      overrides: {},
      expected: { moment: 'daily', clause: { kind: 'openingToday' } },
    },
    {
      label: 'the first second of the countdown',
      now: new Date(2026, 10, 11, 11, 0, 0),
      overrides: {},
      expected: { moment: 'openingCountdown', secondsToOpening: 660, clause: null },
    },
    {
      label: 'the last half second of the countdown',
      now: new Date(2026, 10, 11, 11, 10, 59, 500),
      overrides: {},
      expected: { moment: 'openingCountdown', secondsToOpening: 1 },
    },
    {
      label: 'the stroke of 11:11',
      now: new Date(2026, 10, 11, 11, 11, 0),
      overrides: {},
      expected: { moment: 'carnivalCall', clause: null },
    },
    {
      label: 'her birthday on 11.11. after 11:11',
      now: new Date(2026, 10, 11, 12, 0),
      overrides: { birthDate: '1990-11-11' },
      expected: { moment: 'carnivalCall' },
    },
    {
      label: 'her birthday on the morning of 11.11.',
      now: new Date(2026, 10, 11, 9, 0),
      overrides: { birthDate: '1990-11-11' },
      expected: { moment: 'birthday', clause: { kind: 'openingToday' } },
    },
    {
      label: 'her birthday on Weiberfastnacht',
      now: new Date(2027, 1, 4, 10, 0),
      overrides: { birthDate: '1990-02-04' },
      expected: { moment: 'birthday', clause: { kind: 'sessionDay', day: 86 } },
    },
    {
      label: 'a leap-day birthday in a common year',
      now: new Date(2027, 1, 28, 10, 0),
      overrides: { birthDate: '2000-02-29' },
      expected: { moment: 'birthday' },
    },
    {
      label: 'a leap-day birthday in a leap year',
      now: new Date(2032, 1, 29, 10, 0),
      overrides: { birthDate: '2000-02-29' },
      expected: { moment: 'birthday' },
    },
    {
      label: 'the 28th before a leap-day birthday in a leap year',
      now: new Date(2032, 1, 28, 10, 0),
      overrides: { birthDate: '2000-02-29' },
      expected: { moment: 'daily' },
    },
    {
      label: 'her eleventh year in the club',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { memberSince: '2015-10-02' },
      expected: {
        moment: 'joinAnniversary',
        years: 11,
        clause: { kind: 'untilOpening', days: 40 },
      },
    },
    {
      label: 'her join anniversary while the membership rests',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { memberSince: '2015-10-02', membershipState: 'paused' },
      expected: { moment: 'joinAnniversary', years: 11 },
    },
    {
      label: 'her join anniversary after the membership ended',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { memberSince: '2015-10-02', membershipState: 'ended' },
      expected: { moment: 'daily' },
    },
    {
      label: 'the day she joined',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { memberSince: '2026-10-02' },
      expected: { moment: 'daily' },
    },
    {
      label: 'her birthday on her join anniversary',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { memberSince: '2015-10-02', birthDate: '1996-10-02' },
      expected: { moment: 'birthday' },
    },
    {
      label: 'her join anniversary on Weiberfastnacht',
      now: new Date(2027, 1, 4, 12, 0),
      overrides: { memberSince: '2015-02-04' },
      expected: { moment: 'joinAnniversary', years: 12 },
    },
    {
      label: 'Weiberfastnacht',
      now: new Date(2027, 1, 4, 12, 0),
      overrides: {},
      expected: { moment: 'womensCarnivalDay', clause: null },
    },
    {
      label: 'Aschermittwoch',
      now: new Date(2027, 1, 10, 12, 0),
      overrides: {},
      expected: { moment: 'ashWednesday', clause: null },
    },
    {
      label: 'her first day in the app',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { appSince: '2026-10-02' },
      expected: { moment: 'welcome', clause: { kind: 'untilOpening', days: 40 } },
    },
    {
      label: 'her first day in the app on Rosenmontag',
      now: new Date(2027, 1, 8, 12, 0),
      overrides: { appSince: '2027-02-08' },
      expected: { moment: 'roseMonday' },
    },
  ])('plays $expected.moment on $label', ({ now, overrides, expected }) => {
    expect(greetingActAt(now, viewer(overrides))).toMatchObject(expected);
  });

  it.each([
    {
      label: 'her session is the relevant one',
      now: new Date(2027, 0, 19, 19, 50),
      relevantSession: { startYear: 2026, ordinal: 12 },
      expected: 12,
    },
    {
      label: 'her session lies in the past',
      now: new Date(2027, 0, 19, 19, 50),
      relevantSession: { startYear: 2025, ordinal: 11 },
      expected: null,
    },
    {
      label: 'the next session is already the relevant one',
      now: new Date(2027, 4, 18, 20, 10),
      relevantSession: { startYear: 2027, ordinal: 33 },
      expected: 33,
    },
    {
      label: 'she counts no session',
      now: new Date(2027, 4, 18, 20, 10),
      relevantSession: null,
      expected: null,
    },
  ])('carries the ordinal $expected when $label', ({ now, relevantSession, expected }) => {
    expect(greetingActAt(now, viewer({ relevantSession })).ordinal).toBe(expected);
  });

  it.each<FestiveCase>([
    {
      label: 'her 33rd session is ahead of her',
      now: new Date(2027, 4, 18, 20, 10),
      overrides: { relevantSession: { startYear: 2027, ordinal: 33 } },
      expected: true,
    },
    {
      label: 'her 32nd session is ahead of her',
      now: new Date(2027, 4, 18, 20, 10),
      overrides: { relevantSession: { startYear: 2027, ordinal: 32 } },
      expected: false,
    },
    {
      label: 'the session reaches its 22nd day',
      now: new Date(2026, 11, 2, 12, 0),
      overrides: {},
      expected: true,
    },
    {
      label: 'the opening is 111 days away',
      now: new Date(2027, 6, 23, 12, 0),
      overrides: {},
      expected: true,
    },
    {
      label: 'Weiberfastnacht is eleven days away',
      now: new Date(2027, 0, 24, 12, 0),
      overrides: {},
      expected: true,
    },
    {
      label: 'Weiberfastnacht is ten days away in her 22nd session',
      now: new Date(2027, 0, 25, 12, 0),
      overrides: { relevantSession: { startYear: 2026, ordinal: 22 } },
      expected: false,
    },
    {
      label: 'her birthday',
      now: new Date(2026, 2, 12, 12, 0),
      overrides: {},
      expected: true,
    },
    {
      label: 'her tenth year in the club',
      now: new Date(2025, 9, 2, 12, 0),
      overrides: { memberSince: '2015-10-02' },
      expected: true,
    },
    {
      label: 'her seventh year in the club',
      now: new Date(2026, 9, 2, 12, 0),
      overrides: { memberSince: '2019-10-02' },
      expected: false,
    },
    {
      label: 'the countdown to her 11th session',
      now: new Date(2026, 10, 11, 11, 5),
      overrides: { relevantSession: { startYear: 2026, ordinal: 11 } },
      expected: true,
    },
    {
      label: 'the morning of 11.11. before her 44th session',
      now: new Date(2026, 10, 11, 8, 0),
      overrides: { relevantSession: { startYear: 2026, ordinal: 44 } },
      expected: true,
    },
    {
      label: 'her first day in the app on the morning of her 44th session',
      now: new Date(2026, 10, 11, 8, 0),
      overrides: { relevantSession: { startYear: 2026, ordinal: 44 }, appSince: '2026-11-11' },
      expected: false,
    },
  ])('is festive $expected on $label', ({ now, overrides, expected }) => {
    expect(greetingActAt(now, viewer(overrides)).festive).toBe(expected);
  });
});
