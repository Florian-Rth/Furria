import { describe, expect, it } from 'vitest';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import type { HoldRow } from './planner-holds';
import { relaxHold } from './planner-holds';

const line = (actId: number, options: Partial<DraftLine> = {}): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast: [] },
  placed: true,
  pinned: false,
  blockKey: null,
  eveningChanges: [],
  ...options,
});

const draft: RunningOrderDraft = {
  version: 1,
  lines: [
    line(1, { pinned: true }),
    line(2, { blockKey: 4 }),
    line(3, { blockKey: 4 }),
    line(4),
    line(5, { placed: false }),
  ],
  rules: [
    {
      ruleKey: 'rule:9',
      ruleId: 9,
      kind: 'before',
      strength: 'must',
      actId: 4,
      otherActId: 1,
      actKind: null,
    },
    {
      ruleKey: 'rule:10',
      ruleId: 10,
      kind: 'last',
      strength: 'prefer',
      actId: 4,
      otherActId: null,
      actKind: null,
    },
  ],
  actWishes: [
    { actWishId: 21, actId: 2, kind: 'first', strength: 'must' },
    { actWishId: 22, actId: 3, kind: 'last', strength: 'must' },
  ],
  suspendedActWishIds: [22],
};

const row = (options: Partial<HoldRow>): HoldRow => ({
  id: 'hold',
  kind: 'pin',
  lineKey: null,
  blockKeys: [],
  ruleKey: null,
  actWishId: null,
  held: 1,
  without: 0,
  ...options,
});

describe('relaxHold', () => {
  it('turns a must rule into a preferred one and leaves the others', () => {
    const relaxed = relaxHold(draft, row({ kind: 'mustRule', ruleKey: 'rule:9' }));

    expect(relaxed.rules.map((rule) => rule.strength)).toEqual(['prefer', 'prefer']);
  });
});
