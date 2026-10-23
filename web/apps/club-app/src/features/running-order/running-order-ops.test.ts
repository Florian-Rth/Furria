import { describe, expect, it } from 'vitest';
import {
  applySuggestion,
  bodyOf,
  dissolveBlock,
  draftOf,
  dropAct,
  formBlock,
  moveUnit,
  orderOf,
  pickActs,
  place,
  previewMove,
  togglePin,
  unitsOf,
  unplace,
} from './running-order-ops';
import type { ActWish, CatalogueAct, LineKey, RunningOrderResponse, Suggestion } from './schemas';
import type { DraftLine, RunningOrderDraft } from './types';

interface LineOptions {
  placed?: boolean;
  pinned?: boolean;
  blockKey?: number | null;
  cast?: number[];
}

const act = (actId: number, options: LineOptions = {}): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: {
    actId,
    name: `Auftritt ${actId}`,
    kind: 'dance',
    group: null,
    cast: (options.cast ?? []).map((personId) => ({
      personId,
      firstName: 'Vorname',
      lastName: 'Nachname',
      portrait: null,
      absent: false,
    })),
  },
  placed: options.placed ?? true,
  pinned: options.pinned ?? false,
  blockKey: options.blockKey ?? null,
});

const evening = (lines: DraftLine[], actWishes: ActWish[] = []): RunningOrderDraft => ({
  version: 3,
  lines,
  rules: [],
  actWishes,
  suspendedActWishIds: [],
});

const catalogueAct = (actId: number, wishes: ActWish[] = []): CatalogueAct => ({
  actId,
  name: `Auftritt ${actId}`,
  kind: 'dance',
  group: null,
  archived: false,
  cast: [],
  added: [],
  removed: [],
  wishes,
});

const lineState = (
  draft: RunningOrderDraft,
): { key: LineKey; placed: boolean; pinned: boolean; blockKey: number | null }[] =>
  draft.lines.map(({ key, placed, pinned, blockKey }) => ({ key, placed, pinned, blockKey }));

describe('draftOf and bodyOf', () => {
  const response: RunningOrderResponse = {
    eventId: 9,
    version: 4,
    confirmedAt: null,
    changedSinceConfirmed: false,
    lines: [
      {
        lineId: 11,
        act: { actId: 2, name: 'B', kind: null, group: null, cast: [] },
        position: 1,
        pinned: true,
        blockKey: null,
      },
      {
        lineId: 13,
        act: { actId: 1, name: 'A', kind: null, group: null, cast: [] },
        position: 0,
        pinned: false,
        blockKey: null,
      },
      {
        lineId: 14,
        act: { actId: 3, name: 'C', kind: null, group: null, cast: [] },
        position: null,
        pinned: false,
        blockKey: null,
      },
    ],
    rules: [
      {
        ruleId: 5,
        kind: 'before',
        strength: 'must',
        actId: 1,
        otherActId: 2,
        actKind: null,
      },
    ],
    actWishes: [
      { actWishId: 6, actId: 1, kind: 'first', strength: 'prefer', suspended: true },
      { actWishId: 7, actId: 2, kind: 'last', strength: 'must', suspended: false },
    ],
    findings: [],
  };

  it('orders placed lines by position and keeps suspended wishes', () => {
    const draft = draftOf(response);

    expect([orderOf(draft), draft.suspendedActWishIds, draft.rules[0]?.ruleKey]).toEqual([
      ['act:1', 'act:2'],
      [6],
      'rule:5',
    ]);
  });

  it('writes dense positions and leaves unplaced lines without one', () => {
    expect(bodyOf(draftOf(response))).toEqual({
      version: 4,
      lines: [
        { actId: 1, position: 0, pinned: false, blockKey: null },
        { actId: 2, position: 1, pinned: true, blockKey: null },
        { actId: 3, position: null, pinned: false, blockKey: null },
      ],
      rules: [{ kind: 'before', strength: 'must', actId: 1, otherActId: 2, actKind: null }],
      suspendedActWishIds: [6],
    });
  });
});

describe('unitsOf', () => {
  it('groups a block into one unit and keeps singles alone', () => {
    const draft = evening([
      act(1),
      act(2, { blockKey: 1, pinned: true }),
      act(3, { blockKey: 1, pinned: true }),
      act(4),
    ]);

    expect(unitsOf(draft)).toEqual([
      { keys: ['act:1'], start: 0, pinned: false, blockKey: null },
      { keys: ['act:2', 'act:3'], start: 1, pinned: true, blockKey: 1 },
      { keys: ['act:4'], start: 3, pinned: false, blockKey: null },
    ]);
  });
});

describe('moveUnit', () => {
  it.each<{ label: string; draft: RunningOrderDraft; key: LineKey; to: number; order: LineKey[] }>([
    {
      label: 'a single line moves down',
      draft: evening([act(1), act(2), act(3)]),
      key: 'act:1',
      to: 2,
      order: ['act:2', 'act:3', 'act:1'],
    },
    {
      label: 'a single line moves up',
      draft: evening([act(1), act(2), act(3)]),
      key: 'act:3',
      to: 0,
      order: ['act:3', 'act:1', 'act:2'],
    },
    {
      label: 'a pinned line keeps its index while others pass it',
      draft: evening([act(1), act(2, { pinned: true }), act(3)]),
      key: 'act:1',
      to: 2,
      order: ['act:3', 'act:2', 'act:1'],
    },
    {
      label: 'a pinned line does not move',
      draft: evening([act(1), act(2, { pinned: true }), act(3)]),
      key: 'act:2',
      to: 0,
      order: ['act:1', 'act:2', 'act:3'],
    },
    {
      label: 'a block moves whole',
      draft: evening([act(1), act(2, { blockKey: 1 }), act(3, { blockKey: 1 }), act(4)]),
      key: 'act:3',
      to: 0,
      order: ['act:2', 'act:3', 'act:1', 'act:4'],
    },
    {
      label: 'a block lands next to a pinned line when it cannot straddle it',
      draft: evening([
        act(1, { blockKey: 1 }),
        act(2, { blockKey: 1 }),
        act(3),
        act(4, { pinned: true }),
        act(5),
        act(6),
      ]),
      key: 'act:1',
      to: 3,
      order: ['act:3', 'act:5', 'act:6', 'act:4', 'act:1', 'act:2'],
    },
    {
      label: 'an unplaced line is placed at the index',
      draft: evening([act(1), act(2), act(3, { placed: false })]),
      key: 'act:3',
      to: 1,
      order: ['act:1', 'act:3', 'act:2'],
    },
    {
      label: 'an unknown line changes nothing',
      draft: evening([act(1), act(2)]),
      key: 'act:9',
      to: 0,
      order: ['act:1', 'act:2'],
    },
  ])('$label', ({ draft, key, to, order }) => {
    expect(orderOf(moveUnit(draft, key, to))).toEqual(order);
  });
});

describe('previewMove', () => {
  it('counts the findings of the would-be order', () => {
    const draft = evening([act(1, { cast: [1] }), act(2, { cast: [2] }), act(3, { cast: [1] })]);
    const preview = previewMove(draft, 'act:3', 1);

    expect([preview.order, preview.tally]).toEqual([
      ['act:1', 'act:3', 'act:2'],
      { conflicts: 1, hints: 0 },
    ]);
  });
});

describe('togglePin', () => {
  it.each<{ label: string; draft: RunningOrderDraft; key: LineKey; pinned: boolean[] }>([
    {
      label: 'pins a single line',
      draft: evening([act(1), act(2)]),
      key: 'act:1',
      pinned: [true, false],
    },
    {
      label: 'pins the whole block',
      draft: evening([act(1, { blockKey: 1 }), act(2, { blockKey: 1 }), act(3)]),
      key: 'act:2',
      pinned: [true, true, false],
    },
    {
      label: 'unpins the whole block',
      draft: evening([
        act(1, { blockKey: 1, pinned: true }),
        act(2, { blockKey: 1, pinned: true }),
      ]),
      key: 'act:1',
      pinned: [false, false],
    },
    {
      label: 'leaves an unplaced line alone',
      draft: evening([act(1), act(2, { placed: false })]),
      key: 'act:2',
      pinned: [false, false],
    },
  ])('$label', ({ draft, key, pinned }) => {
    expect(togglePin(draft, key).lines.map((line) => line.pinned)).toEqual(pinned);
  });
});

describe('formBlock', () => {
  it.each<{
    label: string;
    draft: RunningOrderDraft;
    from: LineKey;
    to: LineKey;
    blocks: (number | null)[];
    pinned: boolean[];
  }>([
    {
      label: 'joins a contiguous range',
      draft: evening([act(1), act(2), act(3), act(4)]),
      from: 'act:3',
      to: 'act:2',
      blocks: [null, 1, 1, null],
      pinned: [false, false, false, false],
    },
    {
      label: 'merges an overlapping block',
      draft: evening([act(1), act(2, { blockKey: 4 }), act(3, { blockKey: 4 }), act(4)]),
      from: 'act:1',
      to: 'act:2',
      blocks: [4, 4, 4, null],
      pinned: [false, false, false, false],
    },
    {
      label: 'pins all when one member is pinned',
      draft: evening([act(1, { pinned: true }), act(2), act(3)]),
      from: 'act:1',
      to: 'act:2',
      blocks: [1, 1, null],
      pinned: [true, true, false],
    },
    {
      label: 'needs two lines',
      draft: evening([act(1), act(2)]),
      from: 'act:1',
      to: 'act:1',
      blocks: [null, null],
      pinned: [false, false],
    },
  ])('$label', ({ draft, from, to, blocks, pinned }) => {
    const formed = formBlock(draft, from, to);

    expect([
      formed.lines.map((line) => line.blockKey),
      formed.lines.map((line) => line.pinned),
    ]).toEqual([blocks, pinned]);
  });
});

describe('dissolveBlock', () => {
  it('frees every member of the block and keeps other blocks', () => {
    const draft = evening([
      act(1, { blockKey: 1, pinned: true }),
      act(2, { blockKey: 1, pinned: true }),
      act(3, { blockKey: 2 }),
      act(4, { blockKey: 2 }),
    ]);

    expect(lineState(dissolveBlock(draft, 'act:2'))).toEqual([
      { key: 'act:1', placed: true, pinned: true, blockKey: null },
      { key: 'act:2', placed: true, pinned: true, blockKey: null },
      { key: 'act:3', placed: true, pinned: false, blockKey: 2 },
      { key: 'act:4', placed: true, pinned: false, blockKey: 2 },
    ]);
  });
});

describe('unplace and place', () => {
  it('takes a line out of its block and frees a lonely partner', () => {
    const draft = evening([act(1, { blockKey: 1 }), act(2, { blockKey: 1 }), act(3)]);

    expect(lineState(unplace(draft, 'act:1'))).toEqual([
      { key: 'act:2', placed: true, pinned: false, blockKey: null },
      { key: 'act:3', placed: true, pinned: false, blockKey: null },
      { key: 'act:1', placed: false, pinned: false, blockKey: null },
    ]);
  });

  it('keeps a pinned line at its index when a line before it leaves', () => {
    const draft = evening([act(1), act(2), act(3, { pinned: true }), act(4)]);

    expect(orderOf(unplace(draft, 'act:1'))).toEqual(['act:2', 'act:4', 'act:3']);
  });

  it('places at the end by default', () => {
    const draft = evening([act(1, { placed: false }), act(2), act(3)]);

    expect(orderOf(place(draft, 'act:1'))).toEqual(['act:2', 'act:3', 'act:1']);
  });
});

describe('pickActs', () => {
  it.each<{
    label: string;
    draft: RunningOrderDraft;
    catalogue: CatalogueAct[];
    picks: number[];
    order: LineKey[];
  }>([
    {
      label: 'appends new acts in pick order and keeps existing lines',
      draft: evening([act(1)]),
      catalogue: [catalogueAct(1), catalogueAct(2), catalogueAct(3)],
      picks: [3, 1, 2],
      order: ['act:1', 'act:3', 'act:2'],
    },
    {
      label: 'puts a first wish at the front',
      draft: evening([act(1), act(2)]),
      catalogue: [catalogueAct(3, [{ actWishId: 1, actId: 3, kind: 'first', strength: 'must' }])],
      picks: [3],
      order: ['act:3', 'act:1', 'act:2'],
    },
    {
      label: 'keeps a last-wish act last behind new ones',
      draft: evening(
        [act(1), act(2)],
        [{ actWishId: 1, actId: 2, kind: 'last', strength: 'must' }],
      ),
      catalogue: [catalogueAct(3)],
      picks: [3],
      order: ['act:1', 'act:3', 'act:2'],
    },
    {
      label: 'lets a new last wish take the end',
      draft: evening([act(1), act(2)]),
      catalogue: [
        catalogueAct(3, [{ actWishId: 1, actId: 3, kind: 'last', strength: 'must' }]),
        catalogueAct(4),
      ],
      picks: [3, 4],
      order: ['act:1', 'act:2', 'act:4', 'act:3'],
    },
  ])('$label', ({ draft, catalogue, picks, order }) => {
    expect(orderOf(pickActs(draft, catalogue, picks))).toEqual(order);
  });
});

describe('dropAct', () => {
  it('removes the line, its wishes and the rules naming it', () => {
    const draft: RunningOrderDraft = {
      ...evening([act(1), act(2)], [{ actWishId: 5, actId: 1, kind: 'first', strength: 'must' }]),
      rules: [
        {
          ruleKey: 'rule:1',
          ruleId: 1,
          kind: 'before',
          strength: 'must',
          actId: 2,
          otherActId: 1,
          actKind: null,
        },
      ],
      suspendedActWishIds: [5],
    };
    const dropped = dropAct(draft, 1);

    expect([
      orderOf(dropped),
      dropped.rules,
      dropped.actWishes,
      dropped.suspendedActWishIds,
    ]).toEqual([['act:2'], [], [], []]);
  });
});

describe('applySuggestion', () => {
  const suggestion: Suggestion = {
    order: ['act:3', 'act:1', 'act:2'],
    moves: [{ lineKey: 'act:3', from: 2, to: 0, resolved: [], roomFor: [] }],
    costBefore: 0,
    costAfter: 0,
    roomBefore: 0,
    roomAfter: 0,
    steps: [],
    proven: true,
    holds: [],
    holdsUnavoidable: false,
    conflictsBefore: 1,
    hintsBefore: 0,
    conflictsAfter: 0,
    hintsAfter: 0,
  };

  it.each<{
    label: string;
    draft: RunningOrderDraft;
    lineKeys?: LineKey[];
    order: LineKey[];
  }>([
    {
      label: 'takes the whole proposed order',
      draft: evening([act(1), act(2), act(3)]),
      order: ['act:3', 'act:1', 'act:2'],
    },
    {
      label: 'applies only the chosen moves',
      draft: evening([act(1), act(2), act(3)]),
      lineKeys: ['act:1'],
      order: ['act:1', 'act:2', 'act:3'],
    },
    {
      label: 'falls back to moves when the order would shift a pin',
      draft: evening([act(1, { pinned: true }), act(2), act(3)]),
      order: ['act:1', 'act:3', 'act:2'],
    },
  ])('$label', ({ draft, lineKeys, order }) => {
    expect(orderOf(applySuggestion(draft, suggestion, lineKeys))).toEqual(order);
  });
});
