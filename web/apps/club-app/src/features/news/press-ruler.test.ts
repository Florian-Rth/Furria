import { describe, expect, it } from 'vitest';
import type { HubRow, HubSection } from './hub-view';
import { carnivalShareOf, dateAtCarnivalShare, pressRulerOf } from './press-ruler';

describe('carnivalShareOf', () => {
  it.each([
    { day: new Date(2025, 10, 11), expected: 0 },
    { day: new Date(2025, 11, 31), expected: 0.3 },
    { day: new Date(2026, 1, 11), expected: 0.62 },
    { day: new Date(2026, 1, 18), expected: 0.72 },
    { day: new Date(2026, 10, 10), expected: 1 },
  ])('places $day on the 2025/26 ruler at $expected', ({ day, expected }) => {
    expect(carnivalShareOf(day, 2025)).toBeCloseTo(expected, 1);
  });

  it('puts Rose Monday at the same share in years with different carnival dates', () => {
    const early = carnivalShareOf(new Date(2024, 1, 12), 2023);
    const late = carnivalShareOf(new Date(2025, 2, 3), 2024);

    expect(early).toBeCloseTo(late, 2);
  });
});

describe('dateAtCarnivalShare', () => {
  it.each([
    new Date(2025, 10, 20),
    new Date(2026, 0, 17),
    new Date(2026, 1, 16),
    new Date(2026, 6, 4),
  ])('finds %s back from its share', (day) => {
    expect(dateAtCarnivalShare(carnivalShareOf(day, 2025), 2025)).toEqual(day);
  });
});

const row = (id: number, stage: HubRow['stage'], date: string): HubRow => ({
  id,
  stage,
  title: `Meldung ${id}`,
  category: null,
  picture: null,
  date,
  fact: { kind: 'live' },
});

const section = (rows: HubRow[]): HubSection => ({
  key: 'any',
  kind: 'session',
  startYear: null,
  sessionNumber: null,
  rows,
});

describe('pressRulerOf', () => {
  const now = new Date(2026, 9, 15);
  const view = pressRulerOf(
    [
      section([
        row(1, 'draft', '2026-10-01T10:00:00'),
        row(2, 'live', '2026-02-16T10:00:00'),
        row(3, 'pending', '2026-02-16T12:00:00'),
        row(4, 'withdrawn', '2025-03-03T10:00:00'),
        row(5, 'live', '2023-11-11T11:11:00'),
      ]),
    ],
    now,
  );

  it('lays out one lane per session from the oldest post up to today, newest first', () => {
    expect(view.sessions.map((session) => [session.startYear, session.present])).toEqual([
      [2025, true],
      [2024, false],
      [2023, false],
    ]);
  });

  it('keeps drafts off the lanes and counts the present session by stage', () => {
    expect(view.sessions.flatMap((session) => session.posts.map((post) => post.id))).toEqual([
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(view.stageCounts).toEqual({ draft: 1, live: 1, pending: 1, withdrawn: 0 });
  });

  it('marks month starts inside the season and dots for the summer months', () => {
    const present = view.sessions[0];

    expect([present?.seasonTicks.length, present?.summerTicks.length]).toEqual([3, 7]);
  });
});
