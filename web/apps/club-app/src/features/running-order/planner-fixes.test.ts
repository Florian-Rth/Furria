import { describe, expect, it } from 'vitest';
import { moveUnit, orderOf } from '@/features/running-order/running-order-ops';
import { reviewRunningOrder, tallyOf } from '@/features/running-order/running-order-review';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import {
  bestSpotOf,
  distinctFixesOf,
  fixOf,
  placeAllAtBest,
  placeOptionsOf,
} from './planner-fixes';

const act = (
  actId: number,
  cast: number[],
  options: { pinned?: boolean; placed?: boolean } = {},
): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: {
    actId,
    name: `Auftritt ${actId}`,
    kind: 'dance',
    group: null,
    cast: cast.map((personId) => ({
      personId,
      firstName: 'Vorname',
      lastName: 'Nachname',
      portrait: null,
      absent: personId < 0,
    })),
  },
  placed: options.placed ?? true,
  pinned: options.pinned ?? false,
  blockKey: null,
});

const evening = (lines: DraftLine[]): RunningOrderDraft => ({
  version: 1,
  lines,
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
});

describe('fixOf', () => {
  it('moves one of the two acts apart so the changeover works', () => {
    const draft = evening([act(1, [7]), act(2, [7]), act(3, [8]), act(4, [9])]);
    const [changeover] = reviewRunningOrder(draft);
    const fix = changeover === undefined ? null : fixOf(draft, changeover);

    const fixed = fix === null ? [] : reviewRunningOrder(moveUnit(draft, fix.key, fix.to));

    expect([fix?.fromTray, fixed.filter((finding) => finding.kind === 'noChangeover')]).toEqual([
      false,
      [],
    ]);
  });

  it('never moves a pinned act', () => {
    const draft = evening([
      act(1, [7], { pinned: true }),
      act(2, [7], { pinned: true }),
      act(3, [8]),
    ]);
    const [changeover] = reviewRunningOrder(draft);

    expect(changeover === undefined ? 'none' : fixOf(draft, changeover)).toBeNull();
  });

  it('has no fix for absences', () => {
    const draft = evening([act(1, [-3, 4])]);
    const [absences] = reviewRunningOrder(draft);

    expect(absences === undefined ? 'none' : fixOf(draft, absences)).toBeNull();
  });
});

describe('placeOptionsOf', () => {
  const draft = evening([act(1, [7]), act(2, [8]), act(3, [7])]);

  it('offers every distinct spot once and marks the current one', () => {
    const options = placeOptionsOf(draft, 'act:3');

    expect(options.map((option) => [option.to, option.current])).toEqual([
      [0, false],
      [1, false],
      [2, true],
    ]);
  });

  it('compares the whole evening after each move with now', () => {
    const options = placeOptionsOf(draft, 'act:3');

    expect(options.map((option) => [option.tally.conflicts, option.change])).toEqual([
      [1, 'worse'],
      [1, 'worse'],
      [0, 'same'],
    ]);
  });

  const lastWish = (actId: number): RunningOrderDraft['rules'][number] => ({
    ruleKey: 'draft:1',
    ruleId: null,
    kind: 'last',
    strength: 'must',
    actId,
    otherActId: null,
    actKind: null,
  });

  it('counts the broken wish of a block member that was not tapped', () => {
    const block = evening([
      act(1, [7]),
      act(2, [8]),
      { ...act(3, [9]), blockKey: 1 },
      { ...act(4, [10]), blockKey: 1 },
    ]);
    const options = placeOptionsOf({ ...block, rules: [lastWish(4)] }, 'act:3');

    expect(options.map((option) => [option.to, option.tally.conflicts, option.change])).toEqual([
      [0, 1, 'worse'],
      [1, 1, 'worse'],
      [2, 0, 'same'],
    ]);
  });

  it('counts the wish of another act the move breaks', () => {
    const wished = { ...evening([act(1, [7]), act(2, [8]), act(3, [9])]), rules: [lastWish(3)] };
    const options = placeOptionsOf(wished, 'act:1');

    expect(options.map((option) => [option.to, option.change])).toEqual([
      [0, 'same'],
      [1, 'same'],
      [2, 'worse'],
    ]);
  });

  it('recommends the spot with the fewest findings', () => {
    const crowded = evening([act(1, [7]), act(2, [7]), act(3, [8]), act(4, [9])]);
    const options = placeOptionsOf(crowded, 'act:2');

    expect(options.filter((option) => option.recommended).map((option) => option.to)).toEqual([3]);
  });

  it('prefers the spot closest to now among equally good ones', () => {
    const crowded = evening([act(1, [7]), act(2, [7]), act(3, [8]), act(4, [9]), act(5, [10])]);
    const options = placeOptionsOf(crowded, 'act:2');

    expect(options.filter((option) => option.recommended).map((option) => option.to)).toEqual([3]);
  });

  it('recommends nothing when the current spot is already the best', () => {
    const options = placeOptionsOf(draft, 'act:3');

    expect(options.some((option) => option.recommended)).toBe(false);
  });

  it('marks the first and last spot', () => {
    const options = placeOptionsOf(draft, 'act:3');

    expect(options.map((option) => [option.previousKey, option.last])).toEqual([
      [null, false],
      ['act:1', false],
      ['act:2', true],
    ]);
  });
});

describe('bestSpotOf', () => {
  it('picks the spot with the fewest findings for an act not yet placed', () => {
    const draft = evening([act(1, [7]), act(2, [8]), act(3, [7], { placed: false })]);

    expect(bestSpotOf(draft, 'act:3')).toBe(2);
  });

  it('takes the earliest spot when several are equally good', () => {
    const draft = evening([act(1, [7]), act(2, [8]), act(3, [9], { placed: false })]);

    expect(bestSpotOf(draft, 'act:3')).toBe(0);
  });
});

describe('placeAllAtBest', () => {
  it('places every waiting act without creating a conflict', () => {
    const draft = evening([
      act(1, [7]),
      act(2, [8]),
      act(3, [9]),
      act(4, [7], { placed: false }),
      act(5, [8], { placed: false }),
    ]);
    const placed = placeAllAtBest(draft);

    expect([orderOf(placed).length, tallyOf(reviewRunningOrder(placed)).conflicts]).toEqual([5, 0]);
  });
});

describe('distinctFixesOf', () => {
  it('offers the same fix only on the first finding it solves', () => {
    const draft = evening([act(1, [7]), act(2, [7]), act(3, [8]), act(4, [9])]);
    const [changeover] = reviewRunningOrder(draft);
    const groups = changeover === undefined ? [] : [[changeover], [changeover]];
    const fixes = distinctFixesOf(draft, groups);

    expect([fixes[0] === null, fixes[1]]).toEqual([false, null]);
  });
});
