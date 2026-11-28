import { describe, expect, it } from 'vitest';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import { outcomeOfRule } from './planner-wishes';

const act = (
  actId: number,
  options: { pinned?: boolean; blockKey?: number | null; kind?: 'dance' | 'speech' } = {},
): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: options.kind ?? 'dance', group: null, cast: [] },
  placed: true,
  pinned: options.pinned ?? false,
  blockKey: options.blockKey ?? null,
});

const draft: RunningOrderDraft = {
  version: 1,
  lines: [
    act(1, { pinned: true }),
    act(2, { blockKey: 1, kind: 'speech' }),
    act(3, { blockKey: 1, kind: 'speech' }),
  ],
  rules: [
    {
      ruleKey: 'rule:5',
      ruleId: 5,
      kind: 'before',
      strength: 'prefer',
      actId: 3,
      otherActId: 1,
      actKind: null,
    },
    {
      ruleKey: 'rule:6',
      ruleId: 6,
      kind: 'kindSpread',
      strength: 'must',
      actId: null,
      otherActId: null,
      actKind: 'speech',
    },
  ],
  actWishes: [
    { actWishId: 8, actId: 1, kind: 'first', strength: 'must' },
    { actWishId: 9, actId: 2, kind: 'last', strength: 'must' },
    { actWishId: 10, actId: 3, kind: 'early', strength: 'prefer' },
  ],
  suspendedActWishIds: [10],
};

describe('outcomeOfRule', () => {
  it.each([
    ['last', 'must', 'conflict'],
    ['last', 'prefer', 'hint'],
  ] as const)('a %s %s wish for act 1 is %s today', (kind, strength, state) => {
    expect(
      outcomeOfRule(draft, { kind, strength, actId: 1, otherActId: null, actKind: null }),
    ).toBe(state);
  });
});
