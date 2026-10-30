import { describe, expect, it } from 'vitest';
import type { CatalogueAct, EveningChange } from '@/features/running-order/schemas';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import { toggledDraftOf } from './season-toggle';

const lineOf = (actId: number, eveningChanges: EveningChange[] = []): DraftLine => ({
  key: `act:${actId}`,
  lineId: actId * 10,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast: [] },
  placed: true,
  pinned: false,
  blockKey: null,
  eveningChanges,
});

const catalogueAct = (actId: number): CatalogueAct => ({
  actId,
  name: `Auftritt ${actId}`,
  kind: 'dance',
  group: null,
  sessionYear: 2026,
  closed: false,
  archived: false,
  cast: [],
  added: [],
  removed: [],
  wishes: [],
});

const evening = (lines: DraftLine[]): RunningOrderDraft => ({
  version: 2,
  lines,
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
});

const actIdsOf = (draft: RunningOrderDraft | null): number[] | null =>
  draft === null ? null : draft.lines.map((line) => line.act.actId);

describe('toggledDraftOf', () => {
  it.each([
    ['adds a new act at the end', [lineOf(1)], 2, true, [1, 2]],
    ['removes a plain act', [lineOf(1), lineOf(2)], 2, false, [1]],
    ['refuses an act already on the evening', [lineOf(1)], 1, true, null],
    ['refuses to remove an act adjusted for the evening', [lineOf(1, ['cast'])], 1, false, null],
    ['refuses to remove an act not on the evening', [lineOf(1)], 2, false, null],
  ] as const)('%s', (_name, lines, actId, add, expected) => {
    expect(actIdsOf(toggledDraftOf(evening([...lines]), catalogueAct(actId), add))).toEqual(
      expected === null ? null : [...expected],
    );
  });
});
