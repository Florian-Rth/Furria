import { describe, expect, it } from 'vitest';
import type { CommitPlan, DeskSource } from './inbox-desk';
import { commitPlanOf, defaultSlotsOf, deskOf, reconcileCulling } from './inbox-desk';
import type { CullState } from './light-table';
import { cull, startCulling } from './light-table';

const item = (
  mediaItemId: number,
  capturedAt: string | null,
  state: DeskSource['state'] = 'ready',
): DeskSource => ({ mediaItemId, state, capturedAt, uploadedAt: '2026-02-15T09:00:00Z' });

describe('deskOf', () => {
  it('lays ready, unhidden items out by capture time and splits scenes at gaps', () => {
    const desk = deskOf(
      [
        item(3, '2026-02-14T20:10:00Z'),
        item(1, '2026-02-14T20:00:00Z'),
        item(2, '2026-02-14T20:00:30Z'),
        item(4, '2026-02-14T20:11:00Z', 'processing'),
        item(5, '2026-02-14T20:10:20Z'),
      ],
      new Set([5]),
    );
    expect(desk.frames).toEqual([
      { id: 1, scene: 0 },
      { id: 2, scene: 0 },
      { id: 3, scene: 1 },
    ]);
    expect(desk.developing).toBe(1);
  });
});

describe('reconcileCulling', () => {
  it('keeps verdicts and the current frame across new arrivals and departures', () => {
    const before = cull(
      cull(
        startCulling([
          { id: 1, scene: 0 },
          { id: 2, scene: 0 },
          { id: 3, scene: 0 },
        ]),
        { kind: 'reject', wholeScene: false },
      ),
      { kind: 'file', slot: 1, wholeScene: false },
    );
    const after = reconcileCulling(before, [
      { id: 2, scene: 0 },
      { id: 3, scene: 0 },
      { id: 9, scene: 1 },
    ]);
    expect(after.verdicts).toEqual({ 2: { kind: 'filed', slot: 1 } });
    expect(after.frames[after.cursor]?.id).toBe(3);
    expect(after.history.map((step) => step.changed.map((change) => change.id))).toEqual([[2]]);
  });
});

describe('commitPlanOf', () => {
  it.each<[string, (number | null)[], CommitPlan]>([
    [
      'places filed frames per album and rejects the rest',
      [10, 20, null],
      {
        placements: [
          { albumId: 10, mediaItemIds: [1, 4] },
          { albumId: 20, mediaItemIds: [2] },
        ],
        rejects: [3],
      },
    ],
    [
      'leaves frames filed into an empty slot',
      [10, null, null],
      { placements: [{ albumId: 10, mediaItemIds: [1, 4] }], rejects: [3] },
    ],
  ])('%s', (_, slots, expected) => {
    const state: CullState = {
      ...startCulling([
        { id: 1, scene: 0 },
        { id: 2, scene: 0 },
        { id: 3, scene: 0 },
        { id: 4, scene: 1 },
        { id: 5, scene: 1 },
      ]),
      verdicts: {
        1: { kind: 'filed', slot: 0 },
        2: { kind: 'filed', slot: 1 },
        3: { kind: 'rejected' },
        4: { kind: 'filed', slot: 0 },
      },
    };
    expect(commitPlanOf(state, slots)).toEqual(expected);
  });
});

describe('defaultSlotsOf', () => {
  it('picks the newest albums first', () => {
    expect(
      defaultSlotsOf(
        [
          { albumId: 1, createdAt: '2026-01-01T00:00:00Z' },
          { albumId: 2, createdAt: '2026-03-01T00:00:00Z' },
          { albumId: 3, createdAt: '2026-02-01T00:00:00Z' },
          { albumId: 4, createdAt: '2025-12-01T00:00:00Z' },
        ],
        3,
      ),
    ).toEqual([2, 3, 1]);
  });
});
