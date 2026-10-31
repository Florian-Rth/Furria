import { describe, expect, it } from 'vitest';
import type { HistoryActMark, SessionPhase } from './act-history';
import { actHistoryOf, historyActMarkOf, sessionPhaseOf } from './act-history';

const act = (actId: number, name: string, sessionYear: number, archived = false) => ({
  actId,
  name,
  kind: 'dance' as const,
  sessionYear,
  closed: sessionYear < 2026,
  archived,
  castSize: 12,
  viewerInCast: false,
});

describe('actHistoryOf', () => {
  it('lists every session newest first, filling the years without an act', () => {
    const history = actHistoryOf({
      relevantSessionYear: 2026,
      acts: [act(1, 'Marsch', 2026), act(2, 'Polka', 2023), act(3, 'Walzer', 2027)],
    });

    expect(
      history.map((session) => [
        session.sessionYear,
        session.phase,
        session.acts.map((entry) => entry.actId),
      ]),
    ).toEqual([
      [2027, 'coming', [3]],
      [2026, 'running', [1]],
      [2025, 'over', []],
      [2024, 'over', []],
      [2023, 'over', [2]],
    ]);
  });

  it('keeps the running session even before its first act', () => {
    expect(
      actHistoryOf({ relevantSessionYear: 2026, acts: [] }).map((session) => session.sessionYear),
    ).toEqual([2026]);
  });

  it('orders a session’s acts by name with archived ones last', () => {
    const [session] = actHistoryOf({
      relevantSessionYear: 2026,
      acts: [act(1, 'Zapfenstreich', 2026), act(2, 'Abmarsch', 2026, true), act(3, 'Marsch', 2026)],
    });

    expect(session?.acts.map((entry) => entry.actId)).toEqual([3, 1, 2]);
  });
});

describe('sessionPhaseOf', () => {
  it.each<[number, SessionPhase]>([
    [2025, 'over'],
    [2026, 'running'],
    [2027, 'coming'],
  ])('session %s → %s', (sessionYear, expected) => {
    expect(sessionPhaseOf(sessionYear, 2026)).toBe(expected);
  });
});

describe('historyActMarkOf', () => {
  it.each<[boolean, boolean, HistoryActMark]>([
    [true, true, 'archived'],
    [false, true, 'mine'],
    [false, false, null],
  ])('archived %s, in cast %s → %s', (archived, viewerInCast, expected) => {
    expect(historyActMarkOf({ ...act(1, 'Marsch', 2026, archived), viewerInCast })).toBe(expected);
  });
});
