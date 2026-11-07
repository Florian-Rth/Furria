import type { HistoryTop } from '@furria/studio/history-turn';
import {
  combinedStatusOf,
  historyLinesOf,
  redoTurnOf,
  undoTurnOf,
} from '@furria/studio/history-turn';
import { describe, expect, it } from 'vitest';

const top = (key: string, undoAt: number | null, redoAt: number | null): HistoryTop => ({
  key,
  undoAt,
  redoAt,
});

describe('undoTurnOf', () => {
  it.each<{ tops: HistoryTop[]; turn: string | null }>([
    { tops: [], turn: null },
    { tops: [top('session', null, null), top('evening', null, 4)], turn: null },
    { tops: [top('session', 5, null)], turn: 'session' },
    { tops: [top('session', 9, null), top('evening', 5, null)], turn: 'session' },
    { tops: [top('session', 5, null), top('evening', 9, null)], turn: 'evening' },
  ])('undoes the newest edit first: $tops', ({ tops, turn }) => {
    expect(undoTurnOf(tops)).toBe(turn);
  });
});

describe('redoTurnOf', () => {
  it.each<{ tops: HistoryTop[]; turn: string | null }>([
    { tops: [top('session', 3, null)], turn: null },
    { tops: [top('session', null, 5)], turn: 'session' },
    { tops: [top('session', null, 9), top('evening', null, 5)], turn: 'evening' },
    { tops: [top('session', null, 5), top('evening', 7, null)], turn: null },
    { tops: [top('session', null, 5), top('evening', 3, null)], turn: 'session' },
  ])('redoes the last undone edit unless a newer edit followed: $tops', ({ tops, turn }) => {
    expect(redoTurnOf(tops)).toBe(turn);
  });
});

describe('combinedStatusOf', () => {
  it.each([
    { statuses: [], status: null },
    { statuses: ['saved', 'saved'], status: 'saved' },
    { statuses: ['saved', 'saving'], status: 'saving' },
    { statuses: ['saving', 'failed'], status: 'failed' },
  ] as const)('shows the weakest save state: $statuses', ({ statuses, status }) => {
    expect(combinedStatusOf(statuses)).toBe(status);
  });
});

describe('historyLinesOf', () => {
  it('merges the editors newest first with undone steps on top', () => {
    const lines = historyLinesOf([
      {
        key: '4',
        eventId: null,
        records: [
          { kinds: ['stepMove'], at: 30, undone: true },
          { kinds: ['spotAdd', 'tracks'], at: 10, undone: false },
        ],
      },
      { key: '4:9', eventId: 9, records: [{ kinds: ['spotAssign'], at: 20, undone: false }] },
    ]);

    expect(lines.map(({ kind, eventId, undone }) => [kind, eventId, undone])).toEqual([
      ['stepMove', null, true],
      ['spotAssign', 9, false],
      ['spotAdd', null, false],
    ]);
  });
});
