import { describe, expect, it } from 'vitest';
import type { CommitPlan } from './inbox-desk';
import { commitPlanOf } from './inbox-desk';
import type { CullState } from './light-table';
import { startCulling } from './light-table';

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
