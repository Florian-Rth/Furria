import { describe, expect, it } from 'vitest';
import type { StudioHistory, StudioHistoryEntry } from './studio-history';
import {
  EMPTY_HISTORY,
  flippedIn,
  nextRedoOf,
  nextUndoOf,
  recordedIn,
  remappedIn,
} from './studio-history';

const entry = (
  id: number,
  state: StudioHistoryEntry['state'] = 'done',
  fixed = false,
): StudioHistoryEntry => ({
  id,
  kind: 'stepStart',
  eventId: null,
  at: '2026-10-30T12:00:00Z',
  state,
  applied: { kind: 'stepStart', stepId: id, atSeconds: 0 },
  reverse: fixed ? null : { kind: 'stepStart', stepId: id, atSeconds: id },
});

const historyOf = (...entries: StudioHistoryEntry[]): StudioHistory => ({ entries, busy: false });

describe('recordedIn', () => {
  it('drops what was undone when a new write follows', () => {
    const history = historyOf(entry(1), entry(2, 'undone'));

    expect(recordedIn(history, entry(3)).entries.map((kept) => kept.id)).toEqual([1, 3]);
  });

  it('keeps at most a hundred writes', () => {
    const full = historyOf(...Array.from({ length: 100 }, (_, index) => entry(index + 1)));

    const next = recordedIn(full, entry(101));

    expect([next.entries.length, next.entries[0]?.id]).toEqual([100, 2]);
  });
});

describe('nextUndoOf and nextRedoOf', () => {
  it.each<{ name: string; history: StudioHistory; undo: number | null; redo: number | null }>([
    { name: 'nothing written', history: EMPTY_HISTORY, undo: null, redo: null },
    { name: 'two writes', history: historyOf(entry(1), entry(2)), undo: 2, redo: null },
    {
      name: 'one undone',
      history: historyOf(entry(1), entry(2, 'undone'), entry(3, 'undone')),
      undo: 1,
      redo: 2,
    },
    {
      name: 'a write that cannot be undone blocks the ones before it',
      history: historyOf(entry(1), entry(2, 'done', true)),
      undo: null,
      redo: null,
    },
  ])('$name', ({ history, undo, redo }) => {
    expect([nextUndoOf(history)?.id ?? null, nextRedoOf(history)?.id ?? null]).toEqual([
      undo,
      redo,
    ]);
  });
});

describe('flippedIn', () => {
  it('marks an undone write and keeps its redo', () => {
    const redo = { kind: 'stepStart', stepId: 1, atSeconds: 9 } as const;

    const flipped = flippedIn(historyOf(entry(1)), 1, redo);

    expect(flipped.entries[0]).toEqual({
      ...entry(1),
      state: 'undone',
      applied: entry(1).reverse,
      reverse: redo,
    });
  });
});

describe('remappedIn', () => {
  it('points older writes at the id a restore created', () => {
    const history = historyOf(entry(5), entry(6));

    const remapped = remappedIn(history, { entity: 'step', renames: new Map([[5, 50]]) });

    expect(remapped.entries.map((kept) => kept.reverse)).toEqual([
      { kind: 'stepStart', stepId: 50, atSeconds: 5 },
      { kind: 'stepStart', stepId: 6, atSeconds: 6 },
    ]);
  });
});
