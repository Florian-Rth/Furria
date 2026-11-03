import type { Patch } from 'immer';
import { applyPatches, enablePatches, produceWithPatches } from 'immer';
import { patchedIfAllFit, patchedWhereFitting } from './document-patches';
import type { StudioChange } from './studio-changes';
import { applyChange, mergeKeyOf } from './studio-changes';
import type { StudioDocument } from './studio-document';
import { itemOf } from './studio-document';

enablePatches();

export const NUDGE_MERGE_MS = 1000;

export type ChangeKind = StudioChange['kind'];

export interface HistoryEntry {
  patches: readonly Patch[];
  inversePatches: readonly Patch[];
  kinds: readonly ChangeKind[];
  mergeKey: string | null;
  at: number;
}

export interface HistoryRecord {
  kinds: readonly ChangeKind[];
  at: number;
  undone: boolean;
}

export interface EditState {
  document: StudioDocument;
  past: readonly HistoryEntry[];
  future: readonly HistoryEntry[];
  gesture: HistoryEntry | null;
  pending: readonly Patch[];
}

export const editStateOf = (document: StudioDocument): EditState => ({
  document,
  past: [],
  future: [],
  gesture: null,
  pending: [],
});

const joined = (entry: HistoryEntry, later: HistoryEntry): HistoryEntry => ({
  patches: [...entry.patches, ...later.patches],
  inversePatches: [...later.inversePatches, ...entry.inversePatches],
  kinds: [...new Set([...entry.kinds, ...later.kinds])],
  mergeKey: entry.mergeKey,
  at: later.at,
});

const mergesInto = (top: HistoryEntry | undefined, entry: HistoryEntry): top is HistoryEntry =>
  top !== undefined &&
  entry.mergeKey !== null &&
  top.mergeKey === entry.mergeKey &&
  entry.at - top.at <= NUDGE_MERGE_MS;

const pastWith = (past: readonly HistoryEntry[], entry: HistoryEntry): HistoryEntry[] => {
  const top = past.at(-1);

  return mergesInto(top, entry) ? [...past.slice(0, -1), joined(top, entry)] : [...past, entry];
};

export const edited = (state: EditState, change: StudioChange, at: number): EditState => {
  const [document, patches, inversePatches] = produceWithPatches(state.document, (draft) => {
    applyChange(draft, change);
  });

  if (patches.length === 0) {
    return state;
  }

  const entry: HistoryEntry = {
    patches,
    inversePatches,
    kinds: [change.kind],
    mergeKey: mergeKeyOf(change),
    at,
  };

  return {
    ...state,
    document,
    future: [],
    pending: [...state.pending, ...patches],
    ...(state.gesture === null
      ? { past: pastWith(state.past, entry) }
      : { gesture: joined(state.gesture, { ...entry, mergeKey: null }) }),
  };
};

export const gestureStarted = (state: EditState, at: number): EditState =>
  state.gesture === null
    ? { ...state, gesture: { patches: [], inversePatches: [], kinds: [], mergeKey: null, at } }
    : state;

export const gestureEnded = (state: EditState): EditState => {
  if (state.gesture === null) {
    return state;
  }

  return state.gesture.patches.length === 0
    ? { ...state, gesture: null }
    : { ...state, gesture: null, past: [...state.past, state.gesture] };
};

export const undone = (state: EditState): EditState => {
  const closed = gestureEnded(state);
  const entry = closed.past.at(-1);

  if (entry === undefined) {
    return closed;
  }

  return {
    ...closed,
    document: applyPatches(closed.document, entry.inversePatches),
    past: closed.past.slice(0, -1),
    future: [...closed.future, { ...entry, mergeKey: null }],
    pending: [...closed.pending, ...entry.inversePatches],
  };
};

export const redone = (state: EditState): EditState => {
  const closed = gestureEnded(state);
  const entry = closed.future.at(-1);

  if (entry === undefined) {
    return closed;
  }

  return {
    ...closed,
    document: applyPatches(closed.document, entry.patches),
    past: [...closed.past, entry],
    future: closed.future.slice(0, -1),
    pending: [...closed.pending, ...entry.patches],
  };
};

export const canUndo = (state: EditState): boolean =>
  state.past.length > 0 || (state.gesture?.patches.length ?? 0) > 0;

export const canRedo = (state: EditState): boolean => state.future.length > 0;

const recordOf = (entry: HistoryEntry, undone: boolean): HistoryRecord => ({
  kinds: entry.kinds,
  at: entry.at,
  undone,
});

export const historyRecordsOf = (state: EditState): HistoryRecord[] => {
  const open =
    state.gesture !== null && state.gesture.patches.length > 0
      ? [recordOf(state.gesture, false)]
      : [];

  return [
    ...state.future.map((entry) => recordOf(entry, true)),
    ...open,
    ...[...state.past].reverse().map((entry) => recordOf(entry, false)),
  ];
};

const applicablePastOf = (
  document: StudioDocument,
  past: readonly HistoryEntry[],
): HistoryEntry[] => {
  const kept: HistoryEntry[] = [];
  let probe = document;

  for (const entry of [...past].reverse()) {
    const undoneProbe = patchedIfAllFit(probe, entry.inversePatches);
    if (undoneProbe === null) {
      break;
    }
    kept.unshift(entry);
    probe = undoneProbe;
  }

  return kept;
};

export interface Rebase {
  state: EditState;
  droppedUndoSteps: number;
  skippedChanges: number;
}

const reconciledOrderOf = (
  replayed: readonly number[],
  fresh: readonly number[],
  exists: (id: number) => boolean,
): number[] => {
  const kept = replayed.filter((id, index) => exists(id) && replayed.indexOf(id) === index);

  return [...kept, ...fresh.filter((id) => exists(id) && !kept.includes(id))];
};

const withReconciledOrders = (document: StudioDocument, fresh: StudioDocument): StudioDocument => ({
  ...document,
  songOrder: reconciledOrderOf(
    document.songOrder,
    fresh.songOrder,
    (songId) => itemOf(document.songs, songId) !== null,
  ),
  spotOrder: reconciledOrderOf(
    document.spotOrder,
    fresh.spotOrder,
    (spotId) => itemOf(document.spots, spotId) !== null,
  ),
});

export type RebaseMode = 'replayPending' | 'dropPending';

export const rebased = (state: EditState, fresh: StudioDocument, mode: RebaseMode): Rebase => {
  const closed = gestureEnded(state);
  const replayed =
    mode === 'replayPending'
      ? patchedWhereFitting(fresh, closed.pending)
      : { document: fresh, skipped: closed.pending.length };
  const document = withReconciledOrders(replayed.document, fresh);
  const past = applicablePastOf(document, closed.past);

  return {
    state: {
      document,
      past,
      future: [],
      gesture: null,
      pending: mode === 'replayPending' ? closed.pending : [],
    },
    droppedUndoSteps: closed.past.length - past.length,
    skippedChanges: replayed.skipped,
  };
};

export const savedUpTo = (state: EditState, pendingCount: number): EditState => ({
  ...state,
  pending: state.pending.slice(pendingCount),
});
