import type { RunningOrderDraft } from '@/features/running-order/types';

export interface HistoryStep {
  stepId: number;
  before: RunningOrderDraft;
}

export interface Rewind {
  draft: RunningOrderDraft;
  history: HistoryStep[];
}

export const HISTORY_LIMIT = 40;

export const pushStep = (
  history: readonly HistoryStep[],
  step: HistoryStep,
  limit: number = HISTORY_LIMIT,
): HistoryStep[] => [...history, step].slice(-limit);

export const rewindLatest = (history: readonly HistoryStep[]): Rewind | null => {
  const last = history.at(-1);

  return last === undefined ? null : { draft: last.before, history: history.slice(0, -1) };
};

export const rewindTo = (history: readonly HistoryStep[], stepId: number): Rewind | null => {
  const index = history.findIndex((step) => step.stepId === stepId);
  const step = history[index];

  return step === undefined ? null : { draft: step.before, history: history.slice(0, index) };
};
