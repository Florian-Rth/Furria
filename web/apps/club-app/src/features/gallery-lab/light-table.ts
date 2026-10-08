export type CullVerdict = { kind: 'open' } | { kind: 'rejected' } | { kind: 'filed'; slot: number };

export interface CullFrame {
  id: number;
  scene: number;
}

export type CullIntent =
  | { kind: 'step'; delta: number }
  | { kind: 'jump'; id: number }
  | { kind: 'reject'; wholeScene: boolean }
  | { kind: 'file'; slot: number; wholeScene: boolean }
  | { kind: 'confirm' }
  | { kind: 'cancel' }
  | { kind: 'undo' };

export type PendingSceneVerdict = { kind: 'rejected' } | { kind: 'filed'; slot: number };

export interface CullDeparture {
  key: number;
  id: number;
  verdict: PendingSceneVerdict;
}

interface CullStep {
  cursor: number;
  changed: { id: number; before: CullVerdict }[];
}

export interface CullState {
  frames: readonly CullFrame[];
  cursor: number;
  verdicts: Record<number, CullVerdict>;
  pending: { verdict: PendingSceneVerdict; scene: number } | null;
  history: CullStep[];
  departure: CullDeparture | null;
}

const OPEN: CullVerdict = { kind: 'open' };

export const startCulling = (frames: readonly CullFrame[]): CullState => ({
  frames,
  cursor: 0,
  verdicts: {},
  pending: null,
  history: [],
  departure: null,
});

export const verdictOf = (state: CullState, id: number): CullVerdict => state.verdicts[id] ?? OPEN;

const isOpen = (state: CullState, frame: CullFrame | undefined): boolean =>
  frame !== undefined && verdictOf(state, frame.id).kind === 'open';

const nextOpenFrom = (state: CullState, from: number): number => {
  for (let offset = 0; offset < state.frames.length; offset += 1) {
    const index = (from + offset) % state.frames.length;
    if (isOpen(state, state.frames[index])) {
      return index;
    }
  }
  return from;
};

const clamp = (value: number, max: number): number => Math.min(Math.max(value, 0), max);

export const openCount = (state: CullState): number =>
  state.frames.filter((frame) => isOpen(state, frame)).length;

export const verdictCount = (state: CullState, kind: 'rejected' | 'filed', slot?: number): number =>
  state.frames.filter((frame) => {
    const verdict = verdictOf(state, frame.id);
    if (verdict.kind !== kind) {
      return false;
    }
    return slot === undefined || (verdict.kind === 'filed' && verdict.slot === slot);
  }).length;

const apply = (
  state: CullState,
  ids: readonly number[],
  verdict: PendingSceneVerdict,
): CullState => {
  const current = state.frames[state.cursor];
  if (ids.length === 0 || current === undefined) {
    return state;
  }
  const verdicts = { ...state.verdicts };
  const changed = ids.map((id) => ({ id, before: verdictOf(state, id) }));
  for (const id of ids) {
    verdicts[id] = verdict;
  }
  const settled = { ...state, verdicts };
  return {
    ...settled,
    cursor: nextOpenFrom(settled, state.cursor + 1),
    pending: null,
    history: [...state.history, { cursor: state.cursor, changed }],
    departure: {
      key: (state.departure?.key ?? 0) + 1,
      id: current.id,
      verdict,
    },
  };
};

const sceneOpenIds = (state: CullState, scene: number): number[] =>
  state.frames
    .filter((frame) => frame.scene === scene && isOpen(state, frame))
    .map((frame) => frame.id);

const decide = (state: CullState, verdict: PendingSceneVerdict, wholeScene: boolean): CullState => {
  const current = state.frames[state.cursor];
  if (current === undefined || !isOpen(state, current)) {
    return state;
  }
  if (wholeScene) {
    return { ...state, pending: { verdict, scene: current.scene } };
  }
  return apply(state, [current.id], verdict);
};

const undo = (state: CullState): CullState => {
  const last = state.history.at(-1);
  if (last === undefined) {
    return state;
  }
  const verdicts = { ...state.verdicts };
  for (const { id, before } of last.changed) {
    verdicts[id] = before;
  }
  return {
    ...state,
    verdicts,
    cursor: last.cursor,
    pending: null,
    history: state.history.slice(0, -1),
    departure: null,
  };
};

export const cull = (state: CullState, intent: CullIntent): CullState => {
  const last = state.frames.length - 1;
  switch (intent.kind) {
    case 'step':
      return { ...state, cursor: clamp(state.cursor + intent.delta, last), pending: null };
    case 'jump': {
      const index = state.frames.findIndex((frame) => frame.id === intent.id);
      return index < 0 ? state : { ...state, cursor: index, pending: null };
    }
    case 'reject':
      return decide(state, { kind: 'rejected' }, intent.wholeScene);
    case 'file':
      return decide(state, { kind: 'filed', slot: intent.slot }, intent.wholeScene);
    case 'confirm':
      return state.pending === null
        ? state
        : apply(state, sceneOpenIds(state, state.pending.scene), state.pending.verdict);
    case 'cancel':
      return { ...state, pending: null };
    case 'undo':
      return undo(state);
  }
};
