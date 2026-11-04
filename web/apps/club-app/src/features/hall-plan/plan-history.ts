export const PLAN_HISTORY_LIMIT = 100;

export interface PlanHistory<T> {
  past: readonly T[];
  present: T;
  future: readonly T[];
  coalesceKey: string | null;
}

export const createHistory = <T>(present: T): PlanHistory<T> => ({
  past: [],
  present,
  future: [],
  coalesceKey: null,
});

export const commit = <T>(
  history: PlanHistory<T>,
  next: T,
  coalesceKey: string | null = null,
  limit: number = PLAN_HISTORY_LIMIT,
): PlanHistory<T> => {
  if (next === history.present) {
    return history;
  }
  if (coalesceKey !== null && coalesceKey === history.coalesceKey) {
    return { ...history, present: next, future: [] };
  }

  return {
    past: [...history.past, history.present].slice(-limit),
    present: next,
    future: [],
    coalesceKey,
  };
};

export const endCoalescing = <T>(history: PlanHistory<T>): PlanHistory<T> =>
  history.coalesceKey === null ? history : { ...history, coalesceKey: null };

export const canUndo = <T>(history: PlanHistory<T>): boolean => history.past.length > 0;

export const canRedo = <T>(history: PlanHistory<T>): boolean => history.future.length > 0;

export const undo = <T>(history: PlanHistory<T>): PlanHistory<T> => {
  const previous = history.past.at(-1);
  if (previous === undefined) {
    return history;
  }

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    coalesceKey: null,
  };
};

export const redo = <T>(history: PlanHistory<T>): PlanHistory<T> => {
  const [next, ...rest] = history.future;
  if (next === undefined) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
    coalesceKey: null,
  };
};

export const replacePresent = <T>(history: PlanHistory<T>, present: T): PlanHistory<T> => ({
  ...history,
  present,
  coalesceKey: null,
});
