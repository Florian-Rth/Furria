import { describe, expect, it } from 'vitest';
import type { Suggestion, SuggestionHold } from '@/features/running-order/schemas';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import type { HoldRow } from './planner-holds';
import { holdRowsOf, relaxHold } from './planner-holds';

const line = (actId: number, options: Partial<DraftLine> = {}): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast: [] },
  placed: true,
  pinned: false,
  blockKey: null,
  eveningChanged: false,
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

const hold = (options: Partial<SuggestionHold>): SuggestionHold => ({
  kind: 'pin',
  lineKey: null,
  blockKey: null,
  ruleIndex: null,
  actWishId: null,
  conflictsWithout: 0,
  ...options,
});

const suggestionWith = (holds: SuggestionHold[]): Suggestion => ({
  order: ['act:1', 'act:2', 'act:3', 'act:4'],
  moves: [],
  conflictsBefore: 3,
  hintsBefore: 0,
  conflictsAfter: 3,
  hintsAfter: 0,
  costBefore: 3000,
  costAfter: 3000,
  roomBefore: 0,
  roomAfter: 0,
  steps: [],
  proven: true,
  holds,
  holdsUnavoidable: false,
});

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

describe('holdRowsOf', () => {
  it('resolves every relaxation to its line, block, rule or wish and counts the conflicts it holds', () => {
    const rows = holdRowsOf(
      draft,
      suggestionWith([
        hold({ kind: 'pin', lineKey: 'act:1', conflictsWithout: 0 }),
        hold({ kind: 'block', lineKey: 'act:2', blockKey: 4, conflictsWithout: 1 }),
        hold({ kind: 'mustRule', ruleIndex: 0, conflictsWithout: 2 }),
        hold({ kind: 'mustWish', actWishId: 21, conflictsWithout: 2 }),
      ]),
    );

    expect(rows.map(({ id: _id, ...rest }) => rest)).toEqual([
      {
        kind: 'pin',
        lineKey: 'act:1',
        blockKeys: [],
        ruleKey: null,
        actWishId: null,
        held: 3,
        without: 0,
      },
      {
        kind: 'block',
        lineKey: 'act:2',
        blockKeys: ['act:2', 'act:3'],
        ruleKey: null,
        actWishId: null,
        held: 2,
        without: 1,
      },
      {
        kind: 'mustRule',
        lineKey: null,
        blockKeys: [],
        ruleKey: 'rule:9',
        actWishId: null,
        held: 1,
        without: 2,
      },
      {
        kind: 'mustWish',
        lineKey: null,
        blockKeys: [],
        ruleKey: null,
        actWishId: 21,
        held: 1,
        without: 2,
      },
    ]);
  });

  it('maps a rule by its place in the request, also a rule not saved yet', () => {
    const unsaved: RunningOrderDraft = {
      ...draft,
      rules: [
        ...draft.rules,
        {
          ruleKey: 'draft:1',
          ruleId: null,
          kind: 'first',
          strength: 'must',
          actId: 3,
          otherActId: null,
          actKind: null,
        },
      ],
    };
    const [found] = holdRowsOf(
      unsaved,
      suggestionWith([hold({ kind: 'mustRule', ruleIndex: 2, conflictsWithout: 0 })]),
    );

    expect(found?.ruleKey).toBe('draft:1');
  });

  it('finds a block by its key when the line is not named', () => {
    const [found] = holdRowsOf(
      draft,
      suggestionWith([hold({ kind: 'block', blockKey: 4, conflictsWithout: 2 })]),
    );

    expect(found?.blockKeys).toEqual(['act:2', 'act:3']);
  });

  it.each([
    ['a line that is no longer pinned', hold({ kind: 'pin', lineKey: 'act:4' })],
    ['a block that no longer exists', hold({ kind: 'block', lineKey: 'act:4', blockKey: 7 })],
    ['a rule that is already only preferred', hold({ kind: 'mustRule', ruleIndex: 1 })],
    ['a rule index the draft does not have', hold({ kind: 'mustRule', ruleIndex: 2 })],
    ['a rule without index', hold({ kind: 'mustRule', ruleIndex: null })],
    ['a wish that is off tonight', hold({ kind: 'mustWish', actWishId: 22 })],
    [
      'a relaxation that frees nothing',
      hold({ kind: 'pin', lineKey: 'act:1', conflictsWithout: 3 }),
    ],
  ])('drops %s', (_case, stale) => {
    expect(holdRowsOf(draft, suggestionWith([stale]))).toEqual([]);
  });
});

describe('relaxHold', () => {
  it('frees a pinned line', () => {
    const relaxed = relaxHold(draft, row({ kind: 'pin', lineKey: 'act:1' }));

    expect(relaxed.lines.find((each) => each.key === 'act:1')?.pinned).toBe(false);
  });

  it('dissolves the whole block', () => {
    const relaxed = relaxHold(draft, row({ kind: 'block', lineKey: 'act:3' }));

    expect(relaxed.lines.map((each) => each.blockKey)).toEqual([null, null, null, null, null]);
  });

  it('turns a must rule into a preferred one and leaves the others', () => {
    const relaxed = relaxHold(draft, row({ kind: 'mustRule', ruleKey: 'rule:9' }));

    expect(relaxed.rules.map((rule) => rule.strength)).toEqual(['prefer', 'prefer']);
  });

  it('switches the act wish off for tonight', () => {
    const relaxed = relaxHold(draft, row({ kind: 'mustWish', actWishId: 21 }));

    expect(relaxed.suspendedActWishIds).toEqual([22, 21]);
  });
});
