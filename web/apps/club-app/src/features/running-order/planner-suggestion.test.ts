import { describe, expect, it } from 'vitest';
import { orderOf } from '@/features/running-order/running-order-ops';
import type { LineKey, Suggestion } from '@/features/running-order/schemas';
import type { DraftLine, ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import {
  acceptProposalRow,
  proposalRowsOf,
  proposalShiftsOf,
  proposedDraftOf,
  signatureOf,
} from './planner-suggestion';

const act = (actId: number, options: Partial<DraftLine> = {}): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast: [] },
  placed: true,
  pinned: false,
  blockKey: null,
  ...options,
});

const draft: RunningOrderDraft = {
  version: 1,
  lines: [act(1), act(2), act(3), act(4, { placed: false })],
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
};

const suggestion: Suggestion = {
  order: ['act:2', 'act:1', 'act:4', 'act:3'],
  moves: [
    {
      lineKey: 'act:1',
      from: 0,
      to: 1,
      resolved: [
        { kind: 'noChangeover', lineKeys: ['act:1', 'act:2'] },
        { kind: 'noChangeover', lineKeys: ['act:1', 'act:3'] },
      ],
      roomFor: [],
    },
    {
      lineKey: 'act:4',
      from: null,
      to: 2,
      resolved: [{ kind: 'unplaced', lineKeys: ['act:4'] }],
      roomFor: [7],
    },
    { lineKey: 'act:3', from: 2, to: 3, resolved: [], roomFor: [] },
  ],
  costBefore: 0,
  costAfter: 0,
  roomBefore: 4,
  roomAfter: 1,
  steps: [],
  proven: true,
  holds: [],
  holdsUnavoidable: false,
  conflictsBefore: 1,
  hintsBefore: 1,
  conflictsAfter: 0,
  hintsAfter: 0,
};

const finding = (
  kind: ReviewFinding['kind'],
  severity: ReviewFinding['severity'],
): ReviewFinding => ({
  kind,
  severity,
  lineKeys: [],
  personIds: [],
  ruleKey: null,
  actWishId: null,
});

describe('proposalRowsOf', () => {
  it('lists acts that change places or come from the waiting list, not those merely pushed on', () => {
    expect(proposalRowsOf(draft, suggestion)).toEqual([
      {
        key: 'act:1',
        from: 0,
        to: 1,
        fromTray: false,
        reasons: ['noChangeover'],
        moreRoom: false,
      },
      {
        key: 'act:4',
        from: null,
        to: 2,
        fromTray: true,
        reasons: ['unplaced'],
        moreRoom: true,
      },
    ]);
  });

  it('names more room only where no changeover finding already explains the move', () => {
    const roomy: Suggestion = {
      ...suggestion,
      moves: suggestion.moves.map((move) => ({ ...move, roomFor: [7] })),
    };

    expect(proposalRowsOf(draft, roomy).map((row) => [row.key, row.moreRoom])).toEqual([
      ['act:1', false],
      ['act:4', true],
    ]);
  });

  it('drops a move once the line already stands there', () => {
    const taken: RunningOrderDraft = {
      ...draft,
      lines: [act(2), act(1), act(4), act(3)],
    };

    expect(proposalRowsOf(taken, suggestion)).toEqual([]);
  });

  it('marks only the act that jumps, not those that slide along', () => {
    const line: RunningOrderDraft = { ...draft, lines: [act(1), act(2), act(3), act(5)] };
    const jump: Suggestion = {
      ...suggestion,
      order: ['act:2', 'act:3', 'act:5', 'act:1'],
      moves: [
        { lineKey: 'act:1', from: 0, to: 3, resolved: [], roomFor: [] },
        { lineKey: 'act:2', from: 1, to: 0, resolved: [], roomFor: [] },
      ],
    };

    expect(proposalRowsOf(line, jump).map((row) => row.key)).toEqual(['act:1']);
  });
});

describe('proposedDraftOf', () => {
  it('lays out the whole proposed order, placing waiting acts too', () => {
    expect(orderOf(proposedDraftOf(draft, suggestion))).toEqual(suggestion.order);
  });

  it('keeps a held-together pair in one piece', () => {
    const paired: RunningOrderDraft = {
      ...draft,
      lines: [act(1), act(2, { blockKey: 1 }), act(3, { blockKey: 1 })],
    };
    const order: LineKey[] = ['act:2', 'act:3', 'act:1'];

    expect(orderOf(proposedDraftOf(paired, { ...suggestion, order }))).toEqual(order);
  });
});

describe('acceptProposalRow', () => {
  it('moves only the accepted act to its proposed spot', () => {
    const [row] = proposalRowsOf(draft, suggestion);
    const accepted = row === undefined ? draft : acceptProposalRow(draft, row);

    expect(orderOf(accepted)).toEqual(['act:2', 'act:1', 'act:3']);
  });
});

describe('signatureOf', () => {
  it('ignores the saved version but notices a changed order', () => {
    const saved = { ...draft, version: 9 };
    const moved = { ...draft, lines: [act(2), act(1), act(3), act(4, { placed: false })] };

    expect([
      signatureOf(saved) === signatureOf(draft),
      signatureOf(moved) === signatureOf(draft),
    ]).toEqual([true, false]);
  });

  it('notices a rule that became only preferred', () => {
    const rule = {
      ruleKey: 'rule:3',
      ruleId: 3,
      kind: 'first',
      strength: 'must',
      actId: 1,
      otherActId: null,
      actKind: null,
    } as const;
    const strict = { ...draft, rules: [rule] };
    const relaxed = { ...draft, rules: [{ ...rule, strength: 'prefer' as const }] };

    expect(signatureOf(strict) === signatureOf(relaxed)).toBe(false);
  });
});

describe('proposalShiftsOf', () => {
  it('reports each changed kind once, problems first', () => {
    const before = [
      finding('tightChangeover', 'hint'),
      finding('noChangeover', 'conflict'),
      finding('noChangeover', 'conflict'),
      finding('absences', 'hint'),
    ];
    const after = [
      finding('tightChangeover', 'hint'),
      finding('tightChangeover', 'hint'),
      finding('absences', 'hint'),
    ];

    expect(proposalShiftsOf(before, after)).toEqual([
      { kind: 'noChangeover', severity: 'conflict', before: 2, after: 0 },
      { kind: 'tightChangeover', severity: 'hint', before: 1, after: 2 },
    ]);
  });
});
