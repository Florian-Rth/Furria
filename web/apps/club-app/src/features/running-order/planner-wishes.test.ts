import { describe, expect, it } from 'vitest';
import { reviewRunningOrder } from '@/features/running-order/running-order-review';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import type { LineWish } from './planner-wishes';
import {
  eveningWishesOf,
  lineWishesOf,
  outcomeOfRule,
  ruleOfChoice,
  wishCountOf,
  wishTallyOf,
} from './planner-wishes';

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

const findings = reviewRunningOrder(draft);

describe('lineWishesOf', () => {
  it.each([
    [
      'act:1',
      [
        ['pin', 'met'],
        ['actWish', 'met'],
        ['rule', 'hint'],
      ],
    ],
    [
      'act:2',
      [
        ['block', 'met'],
        ['actWish', 'conflict'],
      ],
    ],
    [
      'act:3',
      [
        ['block', 'met'],
        ['actWish', 'off'],
        ['rule', 'hint'],
      ],
    ],
  ] as const)('reads the wishes of %s with their state today', (key, expected) => {
    expect(lineWishesOf(draft, findings, key).map((wish) => [wish.source, wish.state])).toEqual(
      expected,
    );
  });

  it('keeps evening wishes off the rows', () => {
    expect(eveningWishesOf(draft, findings).map((wish) => [wish.actKind, wish.state])).toEqual([
      ['speech', 'conflict'],
    ]);
  });
});

describe('wishTallyOf', () => {
  it('counts the wishes in effect tonight and those it misses', () => {
    const wish = (state: LineWish['state']): LineWish => ({
      id: state,
      source: 'rule',
      kind: 'first',
      strength: 'must',
      actId: 1,
      otherActId: null,
      actKind: null,
      state,
      ruleKey: null,
      actWishId: null,
    });

    expect(wishTallyOf([wish('met'), wish('conflict'), wish('hint'), wish('off')])).toEqual({
      total: 3,
      missed: 2,
    });
  });
});

describe('wishCountOf', () => {
  it('counts pins, blocks, active act wishes and rules', () => {
    expect(wishCountOf(draft)).toBe(1 + 1 + 2 + 2);
  });
});

describe('ruleOfChoice', () => {
  it.each([
    [{ kind: 'first', strength: 'must', otherActId: null }, 'first'],
    [{ kind: 'apart', strength: 'prefer', otherActId: 4 }, 'apart'],
    [{ kind: 'apart', strength: 'prefer', otherActId: null }, null],
    [{ kind: 'kindSpread', strength: 'must', otherActId: null }, null],
  ] as const)('turns %o into a rule kind %s', (choice, kind) => {
    expect(ruleOfChoice(2, choice)?.kind ?? null).toBe(kind);
  });
});

describe('outcomeOfRule', () => {
  it.each([
    ['first', 'must', 'met'],
    ['last', 'must', 'conflict'],
    ['last', 'prefer', 'hint'],
    ['secondHalf', 'must', 'conflict'],
  ] as const)('a %s %s wish for act 1 is %s today', (kind, strength, state) => {
    expect(
      outcomeOfRule(draft, { kind, strength, actId: 1, otherActId: null, actKind: null }),
    ).toBe(state);
  });
});
