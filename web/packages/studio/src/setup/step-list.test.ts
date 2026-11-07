import { partMovesOf, partRangesOf, splitSecondsOf, stepGroupsOf } from '@furria/studio/step-list';
import { describe, expect, it } from 'vitest';

const order = [1, 2, 3, 4, 5, 6];
const parts = [
  { partId: 20, name: 'Polka', stepIds: [4, 5] },
  { partId: 10, name: 'Marsch', stepIds: [1, 2, 3] },
  { partId: 30, name: 'Leer', stepIds: [] },
];
const ranges = partRangesOf(parts, order);

describe('partRangesOf', () => {
  it('orders parts by music and drops empty ones', () => {
    expect(ranges).toEqual([
      { partId: 10, name: 'Marsch', firstStepId: 1, lastStepId: 3 },
      { partId: 20, name: 'Polka', firstStepId: 4, lastStepId: 5 },
    ]);
  });
});

describe('stepGroupsOf', () => {
  it('groups consecutive steps under their part and keeps the rest loose', () => {
    const rows = [6, 1, 2, 3, 4, 5]
      .sort((left, right) => left - right)
      .map((stepId) => ({ stepId }));
    const loose = partRangesOf([{ partId: 20, name: 'Polka', stepIds: [3, 4] }], order);

    expect(
      stepGroupsOf(rows, loose).map((group) => [group.kind, group.rows.map((row) => row.stepId)]),
    ).toEqual([
      ['loose', [1, 2]],
      ['part', [3, 4]],
      ['loose', [5, 6]],
    ]);
    expect(stepGroupsOf(rows, ranges).map((group) => group.rows.length)).toEqual([3, 2, 1]);
  });
});

describe('partMovesOf', () => {
  it.each([
    [1, [{ kind: 'leave', partId: 10, firstStepId: 2, lastStepId: 3 }], null],
    [3, [{ kind: 'leave', partId: 10, firstStepId: 1, lastStepId: 2 }], null],
    [2, [], 'middle'],
    [
      6,
      [
        { kind: 'join', side: 'previous', partId: 20, firstStepId: 4, lastStepId: 6 },
        { kind: 'newPart', stepId: 6 },
      ],
      null,
    ],
  ] as const)('step %i → %o', (stepId, moves, lock) => {
    expect(partMovesOf(ranges, order, stepId)).toEqual({ moves, lock });
  });

  it('offers both neighbours to a loose step between two parts', () => {
    const split = partRangesOf(
      [
        { partId: 10, name: 'A', stepIds: [1, 2] },
        { partId: 20, name: 'B', stepIds: [4] },
      ],
      order,
    );

    expect(partMovesOf(split, order, 3).moves.map((move) => move.kind)).toEqual([
      'join',
      'join',
      'newPart',
    ]);
    expect(partMovesOf(split, order, 4)).toEqual({
      moves: [{ kind: 'dissolve', partId: 20 }],
      lock: null,
    });
  });
});

describe('splitSecondsOf', () => {
  const counts = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((seconds) => ({ seconds, count: 1 }));
  const step = { stepId: 1, name: '', start: 2, end: 8 };

  it.each([
    [6.2, 6],
    [1, 5],
    [8, 5],
  ])('playhead %s → %s', (playhead, seconds) => {
    expect(splitSecondsOf(step, counts, playhead)).toBe(seconds);
  });

  it('is null when no count lies inside the step', () => {
    expect(splitSecondsOf({ stepId: 1, name: '', start: 2, end: 2.5 }, counts, 2.2)).toBeNull();
  });
});
