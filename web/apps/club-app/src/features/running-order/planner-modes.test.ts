import { describe, expect, it } from 'vitest';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import {
  autoScrollSpeedOf,
  dropBoundariesOf,
  footPlanOf,
  modeCountsOf,
  modeToolsOf,
  nearestBoundaryOf,
  paneViewOf,
  showsPictureOf,
} from './planner-modes';

const act = (actId: number, options: Partial<DraftLine> = {}): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast: [] },
  placed: true,
  pinned: false,
  blockKey: null,
  eveningChanged: false,
  ...options,
});

describe('modeCountsOf', () => {
  it('counts acts, fixed lines, wishes and findings', () => {
    const draft: RunningOrderDraft = {
      version: 1,
      lines: [
        act(1, { pinned: true }),
        act(2, { blockKey: 1 }),
        act(3, { blockKey: 1 }),
        act(4, { placed: false }),
      ],
      rules: [],
      actWishes: [{ actWishId: 1, actId: 1, kind: 'first', strength: 'must' }],
      suspendedActWishIds: [],
    };

    expect(
      modeCountsOf(draft, [
        {
          kind: 'unplaced',
          severity: 'hint',
          lineKeys: ['act:4'],
          personIds: [],
          ruleKey: null,
          actWishId: null,
        },
      ]),
    ).toEqual({ pick: 4, order: 3, wishes: 3, check: 1 });
  });
});

describe('dropBoundariesOf', () => {
  const rows = [
    { key: 'act:1', top: 0, bottom: 50 },
    { key: 'act:2', top: 80, bottom: 130 },
    { key: 'act:3', top: 130, bottom: 180 },
    { key: 'act:4', top: 210, bottom: 260 },
  ] as const;
  const order = ['act:1', 'act:2', 'act:3', 'act:4'] as const;

  it('maps every gap to the place the dragged unit takes without itself', () => {
    expect(dropBoundariesOf(rows, order, ['act:2'])).toEqual([
      { y: 0, target: 0, key: 'act:1', edge: 'before' },
      { y: 130, target: 1, key: 'act:3', edge: 'before' },
      { y: 210, target: 2, key: 'act:4', edge: 'before' },
      { y: 260, target: 3, key: 'act:4', edge: 'after' },
      { y: 105, target: 1, key: 'act:2', edge: 'before' },
    ]);
  });

  it('keeps a whole block together and anchors its home in its middle', () => {
    expect(
      dropBoundariesOf(rows, order, ['act:2', 'act:3']).map(({ y, target }) => [y, target]),
    ).toEqual([
      [0, 0],
      [210, 1],
      [260, 2],
      [130, 1],
    ]);
  });

  it('offers a line from the tray every gap with its plain index', () => {
    expect(dropBoundariesOf(rows, order, ['act:9']).map(({ y, target }) => [y, target])).toEqual([
      [0, 0],
      [80, 1],
      [130, 2],
      [210, 3],
      [260, 4],
    ]);
  });
});

describe('nearestBoundaryOf', () => {
  const boundaries = [
    { y: 0, target: 0, key: 'act:1', edge: 'before' },
    { y: 105, target: 1, key: 'act:2', edge: 'before' },
    { y: 210, target: 2, key: 'act:4', edge: 'before' },
  ] as const;

  it.each([
    [10, 0],
    [60, 1],
    [150, 1],
    [170, 2],
    [900, 2],
  ])('a unit centred at %i lands on place %i', (y, target) => {
    expect(nearestBoundaryOf(boundaries, y)?.target).toBe(target);
  });

  it('finds nothing in an empty list', () => {
    expect(nearestBoundaryOf([], 40)).toBeNull();
  });
});

describe('autoScrollSpeedOf', () => {
  it.each([
    [400, 400, 0],
    [0, 400, -18],
    [900, 400, 18],
    [880, 880, 0],
    [885, 880, 0],
    [990, 880, 18],
    [20, 20, 0],
    [700, 20, 0],
    [-100, 20, -18],
  ])('pointer at %i grabbed at %i scrolls by %i', (pointerY, grabY, speed) => {
    expect(autoScrollSpeedOf(pointerY, grabY, 0, 900)).toBe(speed);
  });
});

describe('showsPictureOf', () => {
  it.each([
    ['order', false, false],
    ['pick', false, true],
    ['check', false, true],
    ['order', true, true],
  ] as const)('%s on a wide screen %s shows the picture: %s', (mode, isWide, shown) => {
    expect(showsPictureOf(mode, isWide)).toBe(shown);
  });
});

describe('footPlanOf', () => {
  const calm = {
    proposing: false,
    confirmed: false,
    picked: 3,
    unplaced: 0,
    conflicts: 0,
    saved: true,
  };

  it.each([
    [
      'pick',
      { picked: 0 },
      { back: null, forward: { kind: 'next', mode: 'order' }, block: { reason: 'nonePicked' } },
    ],
    ['pick', {}, { back: null, forward: { kind: 'next', mode: 'order' }, block: null }],
    [
      'order',
      { unplaced: 2 },
      {
        back: 'pick',
        forward: { kind: 'next', mode: 'check' },
        block: { reason: 'unplaced', count: 2 },
      },
    ],
    [
      'order',
      { conflicts: 1 },
      { back: 'pick', forward: { kind: 'next', mode: 'check' }, block: null },
    ],
    [
      'check',
      { conflicts: 2 },
      { back: 'order', forward: { kind: 'confirm' }, block: { reason: 'conflicts', count: 2 } },
    ],
    [
      'check',
      { saved: false },
      { back: 'order', forward: { kind: 'confirm' }, block: { reason: 'saving' } },
    ],
    [
      'check',
      { picked: 0 },
      { back: 'order', forward: { kind: 'confirm' }, block: { reason: 'nonePicked' } },
    ],
    ['check', {}, { back: 'order', forward: { kind: 'confirm' }, block: null }],
    [
      'check',
      { confirmed: true, conflicts: 1 },
      { back: 'order', forward: { kind: 'reopen' }, block: null },
    ],
  ] as const)('%s with %o', (mode, change, plan) => {
    expect(footPlanOf({ ...calm, ...change, mode })).toEqual({ kind: 'steps', ...plan });
  });

  it('hands the bar to the proposal while one is shown', () => {
    expect(footPlanOf({ ...calm, mode: 'check', proposing: true })).toEqual({
      kind: 'proposal',
    });
  });
});

describe('modeToolsOf', () => {
  it.each([
    ['pick', false, []],
    ['order', false, ['wishes', 'autoOrder']],
    ['order', true, []],
    ['check', false, ['suggest']],
    ['check', true, []],
  ] as const)('%s (proposing %s) offers %o', (mode, proposing, tools) => {
    expect(modeToolsOf(mode, proposing)).toEqual(tools);
  });
});

describe('paneViewOf', () => {
  it.each([
    ['pick', true, 'catalogue'],
    ['order', false, 'findings'],
    ['order', true, 'wishes'],
    ['check', true, 'findings'],
  ] as const)('%s with wishes open %s shows %s', (mode, wishesOpen, view) => {
    expect(paneViewOf(mode, wishesOpen)).toBe(view);
  });
});
