import { useState } from 'react';

export interface LabHistory<Value> {
  value: Value;
  shown: Value;
  canUndo: boolean;
  preview: (next: Value) => void;
  keep: () => void;
  drop: () => void;
  replace: (next: Value) => void;
  undo: () => void;
}

interface HistoryState<Value> {
  past: readonly Value[];
  value: Value;
  draft: Value | null;
}

const UNDO_DEPTH = 50;

export const useLabHistory = <Value>(initial: Value): LabHistory<Value> => {
  const [state, setState] = useState<HistoryState<Value>>({
    past: [],
    value: initial,
    draft: null,
  });
  const pushed = (current: HistoryState<Value>, next: Value): HistoryState<Value> => ({
    past: [...current.past, current.value].slice(-UNDO_DEPTH),
    value: next,
    draft: null,
  });

  return {
    value: state.value,
    shown: state.draft ?? state.value,
    canUndo: state.past.length > 0,
    preview: (next) => setState((current) => ({ ...current, draft: next })),
    keep: () =>
      setState((current) => (current.draft === null ? current : pushed(current, current.draft))),
    drop: () => setState((current) => ({ ...current, draft: null })),
    replace: (next) => setState((current) => pushed(current, next)),
    undo: () =>
      setState((current) => {
        const previous = current.past.at(-1);

        return previous === undefined
          ? current
          : { past: current.past.slice(0, -1), value: previous, draft: null };
      }),
  };
};
