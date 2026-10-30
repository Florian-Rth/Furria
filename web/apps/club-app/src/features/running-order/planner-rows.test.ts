import { describe, expect, it } from 'vitest';
import type { LineKey } from '@/features/running-order/schemas';
import type { DraftLine, ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import {
  placeNumberOf,
  plannerEntriesOf,
  tapBracket,
  unitKeysOf,
  visibleEntriesOf,
} from './planner-rows';

const act = (
  actId: number,
  options: { blockKey?: number | null; placed?: boolean } = {},
): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast: [] },
  placed: options.placed ?? true,
  pinned: false,
  blockKey: options.blockKey ?? null,
  eveningChanges: [],
});

const evening = (lines: DraftLine[]): RunningOrderDraft => ({
  version: 1,
  lines,
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
});

const finding = (
  kind: ReviewFinding['kind'],
  severity: ReviewFinding['severity'],
  lineKeys: LineKey[],
): ReviewFinding => ({ kind, severity, lineKeys, personIds: [], ruleKey: null, actWishId: null });

describe('plannerEntriesOf', () => {
  it('puts an adjacent pair finding on a rail between the two rows', () => {
    const changeover = finding('noChangeover', 'conflict', ['act:1', 'act:2']);
    const entries = plannerEntriesOf(evening([act(1), act(2), act(3)]), [changeover]);

    expect(entries.map((entry) => entry.key)).toEqual([
      'act:1',
      'rail:act:1:act:2',
      'act:2',
      'act:3',
    ]);
    expect(entries[0]?.type === 'line' ? entries[0].findings : null).toEqual([changeover]);
  });

  it('puts any other finding on one strip under its first row and marks every row it touches', () => {
    const tight = finding('tightChangeover', 'hint', ['act:1', 'act:3']);
    const entries = plannerEntriesOf(evening([act(1), act(2), act(3)]), [tight]);

    expect(
      entries.map((entry) => [
        entry.key,
        entry.type === 'rail' ? entry.placement : entry.findings.length,
      ]),
    ).toEqual([
      ['act:1', 1],
      ['strip:tightChangeover:act:1|act:3::', 'under'],
      ['act:2', 0],
      ['act:3', 1],
    ]);
  });

  it.each([
    [0, 'start'],
    [1, 'middle'],
    [2, 'end'],
    [3, null],
  ])('marks the block edge of line %i', (index, edge) => {
    const entries = plannerEntriesOf(
      evening([act(1, { blockKey: 4 }), act(2, { blockKey: 4 }), act(3, { blockKey: 4 }), act(5)]),
      [],
    );
    const entry = entries[index];

    expect(entry?.type === 'line' ? entry.blockEdge : 'rail').toBe(edge);
  });
});

describe('placeNumberOf and unitKeysOf', () => {
  const draft = evening([
    act(1),
    act(2, { blockKey: 1 }),
    act(3, { blockKey: 1 }),
    act(4, { placed: false }),
  ]);

  it('numbers a placed act from one and leaves a waiting act without a number', () => {
    expect([placeNumberOf(draft, 'act:3'), placeNumberOf(draft, 'act:4')]).toEqual([3, null]);
  });

  it('returns the whole block of a key', () => {
    expect(unitKeysOf(draft, 'act:3')).toEqual(['act:2', 'act:3']);
    expect(unitKeysOf(draft, 'act:1')).toEqual(['act:1']);
  });
});

describe('tapBracket', () => {
  const blockOf = (draft: RunningOrderDraft): (number | null)[] =>
    draft.lines.map((line) => line.blockKey);

  it('joins a single line with the next act', () => {
    expect(blockOf(tapBracket(evening([act(1), act(2), act(3)]), 'act:1'))).toEqual([1, 1, null]);
  });

  it('dissolves the block of a line already held together', () => {
    const held = evening([act(1, { blockKey: 2 }), act(2, { blockKey: 2 }), act(3)]);

    expect(blockOf(tapBracket(held, 'act:2'))).toEqual([null, null, null]);
  });

  it('does not join past the end', () => {
    expect(blockOf(tapBracket(evening([act(1), act(2)]), 'act:2'))).toEqual([null, null]);
  });
});

describe('visibleEntriesOf', () => {
  const entries = plannerEntriesOf(evening([act(1), act(2)]), [
    finding('noChangeover', 'conflict', ['act:1', 'act:2']),
    finding('absences', 'hint', ['act:2']),
  ]);

  it.each([
    ['none', ['act:1', 'act:2']],
    ['between', ['act:1', 'rail:act:1:act:2', 'act:2']],
    ['all', ['act:1', 'rail:act:1:act:2', 'act:2', 'strip:absences:act:2::']],
  ] as const)('rail view %s shows %j', (view, keys) => {
    expect(visibleEntriesOf(entries, view).map((entry) => entry.key)).toEqual(keys);
  });
});
