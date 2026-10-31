import type { StudioHistory } from './studio-history';
import { EMPTY_HISTORY } from './studio-history';

type Listener = () => void;

const VISIT_GRACE_MS = 5000;

const histories = new Map<number, StudioHistory>();
const visits = new Map<number, number>();
const leaving = new Map<number, number>();
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

export const enterVisit = (actId: number): void => {
  const timer = leaving.get(actId);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    leaving.delete(actId);
  }
  visits.set(actId, (visits.get(actId) ?? 0) + 1);
};

export const leaveVisit = (actId: number): void => {
  const left = (visits.get(actId) ?? 1) - 1;
  if (left > 0) {
    visits.set(actId, left);
    return;
  }
  visits.delete(actId);
  leaving.set(
    actId,
    window.setTimeout(() => {
      leaving.delete(actId);
      forgetHistory(actId);
    }, VISIT_GRACE_MS),
  );
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
