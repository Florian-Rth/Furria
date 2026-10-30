import type { IdRename } from './studio-remap';
import { writeRenamed } from './studio-remap';
import type { StudioWrite, StudioWriteKind } from './studio-undo';

export type StudioHistoryState = 'done' | 'undone';

export interface StudioHistoryEntry {
  id: number;
  kind: StudioWriteKind;
  eventId: number | null;
  at: string;
  state: StudioHistoryState;
  applied: StudioWrite;
  reverse: StudioWrite | null;
}

export interface StudioHistory {
  entries: readonly StudioHistoryEntry[];
  busy: boolean;
}

export const EMPTY_HISTORY: StudioHistory = { entries: [], busy: false };

const HISTORY_LIMIT = 100;

export const recordedIn = (history: StudioHistory, entry: StudioHistoryEntry): StudioHistory => ({
  ...history,
  entries: [...history.entries.filter((known) => known.state === 'done'), entry].slice(
    -HISTORY_LIMIT,
  ),
});

export const nextUndoOf = (history: StudioHistory): StudioHistoryEntry | null => {
  const done = history.entries.filter((entry) => entry.state === 'done');
  const last = done.at(-1) ?? null;

  return last?.reverse === null ? null : last;
};

export const nextRedoOf = (history: StudioHistory): StudioHistoryEntry | null => {
  const first = history.entries.find((entry) => entry.state === 'undone') ?? null;

  return first?.reverse === null ? null : first;
};

export const flippedIn = (
  history: StudioHistory,
  entryId: number,
  reverse: StudioWrite | null,
): StudioHistory => ({
  ...history,
  entries: history.entries.map((entry) =>
    entry.id === entryId && entry.reverse !== null
      ? {
          ...entry,
          state: entry.state === 'done' ? 'undone' : 'done',
          applied: entry.reverse,
          reverse,
        }
      : entry,
  ),
});

export const stuckIn = (history: StudioHistory, entryId: number): StudioHistory => ({
  ...history,
  entries: history.entries.map((entry) =>
    entry.id === entryId ? { ...entry, reverse: null } : entry,
  ),
});

export const remappedIn = (history: StudioHistory, rename: IdRename | null): StudioHistory =>
  rename === null
    ? history
    : {
        ...history,
        entries: history.entries.map((entry) => ({
          ...entry,
          applied: writeRenamed(rename, entry.applied),
          reverse: entry.reverse === null ? null : writeRenamed(rename, entry.reverse),
        })),
      };

export const withBusy = (history: StudioHistory, busy: boolean): StudioHistory => ({
  ...history,
  busy,
});
