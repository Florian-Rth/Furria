import type { StudioHistory } from './studio-history';
import { EMPTY_HISTORY } from './studio-history';

type Listener = () => void;

const histories = new Map<number, StudioHistory>();
const listeners = new Set<Listener>();
let lastEntryId = 0;

export const historyOf = (actId: number): StudioHistory => histories.get(actId) ?? EMPTY_HISTORY;

export const changeHistory = (
  actId: number,
  change: (history: StudioHistory) => StudioHistory,
): void => {
  histories.set(actId, change(historyOf(actId)));
  for (const listener of listeners) {
    listener();
  }
};

export const forgetHistory = (actId: number): void => {
  if (histories.delete(actId)) {
    for (const listener of listeners) {
      listener();
    }
  }
};

export const subscribeHistory = (listener: Listener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const nextEntryId = (): number => {
  lastEntryId += 1;

  return lastEntryId;
};
