import { describe, expect, it } from 'vitest';
import type { RunningOrderDraft } from '@/features/running-order/types';
import type { HistoryStep } from './planner-history';
import { pushStep, rewindLatest, rewindTo } from './planner-history';

const stateOf = (version: number): RunningOrderDraft => ({
  version,
  lines: [],
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
});

const history: HistoryStep[] = [
  { stepId: 1, before: stateOf(10) },
  { stepId: 2, before: stateOf(20) },
  { stepId: 3, before: stateOf(30) },
];

describe('pushStep', () => {
  it('keeps only the newest steps within the limit', () => {
    expect(pushStep(history, { stepId: 4, before: stateOf(40) }, 2).map((s) => s.stepId)).toEqual([
      3, 4,
    ]);
  });
});

describe('rewindLatest', () => {
  it('returns the state before the newest step and drops it', () => {
    expect(rewindLatest(history)).toEqual({ draft: stateOf(30), history: history.slice(0, 2) });
  });

  it('has nothing to rewind on an empty stack', () => {
    expect(rewindLatest([])).toBeNull();
  });
});

describe('rewindTo', () => {
  it('returns the state before the named step, dropping it and every later step', () => {
    expect(rewindTo(history, 2)).toEqual({ draft: stateOf(20), history: history.slice(0, 1) });
  });

  it('ignores a step that was already undone', () => {
    expect(rewindTo(history, 9)).toBeNull();
  });
});
