import { describe, expect, it } from 'vitest';
import { orderOf } from '@/features/running-order/running-order-ops';
import type { LineKey, Suggestion } from '@/features/running-order/schemas';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import { proposedDraftOf } from './planner-suggestion';

const act = (actId: number, options: Partial<DraftLine> = {}): DraftLine => ({
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

describe('proposedDraftOf', () => {
  it('keeps a held-together pair in one piece', () => {
    const paired: RunningOrderDraft = {
      ...draft,
      lines: [act(1), act(2, { blockKey: 1 }), act(3, { blockKey: 1 })],
    };
    const order: LineKey[] = ['act:2', 'act:3', 'act:1'];

    expect(orderOf(proposedDraftOf(paired, { ...suggestion, order }))).toEqual(order);
  });
});
