import { describe, expect, it } from 'vitest';
import { reviewRunningOrder } from './running-order-review';
import type { ActKind, ActWish, CastPerson, LineKey } from './schemas';
import type { DraftLine, DraftRule, ReviewFinding, RunningOrderDraft } from './types';

const person = (personId: number, absent = false): CastPerson => ({
  personId,
  firstName: 'Vorname',
  lastName: 'Nachname',
  portrait: null,
  absent,
});

interface ActOptions {
  kind?: ActKind;
  placed?: boolean;
}

const act = (actId: number, cast: CastPerson[], options: ActOptions = {}): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: {
    actId,
    name: `Auftritt ${actId}`,
    kind: options.kind ?? 'dance',
    group: { groupId: actId, name: 'Gruppe', tone: null, icon: null, picture: null },
    cast,
  },
  placed: options.placed ?? true,
  pinned: false,
  blockKey: null,
});

const evening = (
  lines: DraftLine[],
  rules: DraftRule[] = [],
  actWishes: ActWish[] = [],
): RunningOrderDraft => ({ version: 1, lines, rules, actWishes, suspendedActWishIds: [] });

const found = (
  kind: ReviewFinding['kind'],
  severity: ReviewFinding['severity'],
  lineKeys: LineKey[],
  extra: Partial<ReviewFinding> = {},
): ReviewFinding => ({
  kind,
  severity,
  lineKeys,
  personIds: [],
  ruleKey: null,
  actWishId: null,
  ...extra,
});

describe('reviewRunningOrder', () => {
  it.each<{ name: string; draft: RunningOrderDraft; findings: ReviewFinding[] }>([
    {
      name: 'adjacentSharedPerson',
      draft: evening([act(1, [person(1), person(2)]), act(2, [person(2), person(1)])]),
      findings: [found('noChangeover', 'conflict', ['act:1', 'act:2'], { personIds: [1, 2] })],
    },
    {
      name: 'oneBetweenSharedPerson',
      draft: evening([act(1, [person(1)]), act(2, [person(2)]), act(3, [person(1)])]),
      findings: [found('tightChangeover', 'hint', ['act:1', 'act:3'], { personIds: [1] })],
    },
    {
      name: 'absentPersonNoConflict',
      draft: evening([act(1, [person(1, true), person(2)]), act(2, [person(1, true), person(3)])]),
      findings: [
        found('absences', 'hint', ['act:1'], { personIds: [1] }),
        found('absences', 'hint', ['act:2'], { personIds: [1] }),
      ],
    },
    {
      name: 'mustFirstBroken',
      draft: evening(
        [act(1, [person(1)]), act(2, [person(2)])],
        [],
        [{ actWishId: 7, actId: 2, kind: 'first', strength: 'must' }],
      ),
      findings: [found('mustRuleBroken', 'conflict', ['act:2'], { actWishId: 7 })],
    },
    {
      name: 'preferLastMissed',
      draft: evening(
        [act(1, [person(1)]), act(2, [person(2)])],
        [
          {
            ruleKey: 'rule:3',
            ruleId: 3,
            kind: 'last',
            strength: 'prefer',
            actId: 1,
            otherActId: null,
            actKind: null,
          },
        ],
      ),
      findings: [found('preferRuleMissed', 'hint', ['act:1'], { ruleKey: 'rule:3' })],
    },
    {
      name: 'twoSpeechesAdjacent',
      draft: evening([
        act(1, [person(1)], { kind: 'speech' }),
        act(2, [person(2)], { kind: 'speech' }),
      ]),
      findings: [found('sameKindAdjacent', 'hint', ['act:1', 'act:2'])],
    },
    {
      name: 'kindSpreadRuleReplacesBuiltIn',
      draft: evening(
        [act(1, [person(1)], { kind: 'speech' }), act(2, [person(2)], { kind: 'speech' })],
        [
          {
            ruleKey: 'rule:4',
            ruleId: 4,
            kind: 'kindSpread',
            strength: 'prefer',
            actId: null,
            otherActId: null,
            actKind: 'speech',
          },
        ],
      ),
      findings: [found('preferRuleMissed', 'hint', ['act:1', 'act:2'], { ruleKey: 'rule:4' })],
    },
    {
      name: 'wholeCastAbsent',
      draft: evening([act(1, [person(1, true), person(2, true)])]),
      findings: [found('nobodyThere', 'conflict', ['act:1'], { personIds: [1, 2] })],
    },
    {
      name: 'unplacedLine',
      draft: evening([act(1, [person(1)]), act(2, [person(2)], { placed: false })]),
      findings: [found('unplaced', 'hint', ['act:2'])],
    },
    {
      name: 'earlyLateThirds',
      draft: evening(
        [1, 2, 3, 4, 5, 6].map((actId) => act(actId, [person(actId)])),
        [],
        [
          { actWishId: 1, actId: 2, kind: 'early', strength: 'must' },
          { actWishId: 2, actId: 3, kind: 'early', strength: 'must' },
          { actWishId: 3, actId: 5, kind: 'late', strength: 'prefer' },
          { actWishId: 4, actId: 4, kind: 'late', strength: 'prefer' },
        ],
      ),
      findings: [
        found('mustRuleBroken', 'conflict', ['act:3'], { actWishId: 2 }),
        found('preferRuleMissed', 'hint', ['act:4'], { actWishId: 4 }),
      ],
    },
    {
      name: 'halvesByIndex',
      draft: evening(
        [1, 2, 3, 4].map((actId) => act(actId, [person(actId)])),
        [],
        [
          { actWishId: 1, actId: 3, kind: 'firstHalf', strength: 'must' },
          { actWishId: 2, actId: 4, kind: 'secondHalf', strength: 'must' },
          { actWishId: 3, actId: 1, kind: 'secondHalf', strength: 'prefer' },
        ],
      ),
      findings: [
        found('preferRuleMissed', 'hint', ['act:1'], { actWishId: 3 }),
        found('mustRuleBroken', 'conflict', ['act:3'], { actWishId: 1 }),
      ],
    },
    {
      name: 'oddCountMiddleInFirstHalf',
      draft: evening(
        [1, 2, 3, 4, 5].map((actId) => act(actId, [person(actId)])),
        [],
        [
          { actWishId: 1, actId: 3, kind: 'firstHalf', strength: 'must' },
          { actWishId: 2, actId: 4, kind: 'firstHalf', strength: 'must' },
        ],
      ),
      findings: [found('mustRuleBroken', 'conflict', ['act:4'], { actWishId: 2 })],
    },
  ])('finds what $name breaks', ({ draft, findings }) => {
    expect(reviewRunningOrder(draft)).toEqual(findings);
  });

  it('skips suspended act wishes', () => {
    const draft: RunningOrderDraft = {
      ...evening(
        [act(1, [person(1)]), act(2, [person(2)])],
        [],
        [{ actWishId: 7, actId: 2, kind: 'first', strength: 'must' }],
      ),
      suspendedActWishIds: [7],
    };

    expect(reviewRunningOrder(draft)).toEqual([]);
  });

  it('keeps apart acts with one act between them', () => {
    const rule: DraftRule = {
      ruleKey: 'rule:1',
      ruleId: 1,
      kind: 'apart',
      strength: 'must',
      actId: 1,
      otherActId: 2,
      actKind: null,
    };
    const together = evening([act(1, [person(1)]), act(2, [person(2)])], [rule]);
    const apart = evening([act(1, [person(1)]), act(3, [person(3)]), act(2, [person(2)])], [rule]);

    expect([reviewRunningOrder(together), reviewRunningOrder(apart)]).toEqual([
      [found('mustRuleBroken', 'conflict', ['act:1', 'act:2'], { ruleKey: 'rule:1' })],
      [],
    ]);
  });
});
