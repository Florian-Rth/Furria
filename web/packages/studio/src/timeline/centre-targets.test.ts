import { describe, expect, it } from 'vitest';
import { pickCentreTarget, targetHitsOf } from './centre-targets';

const BANDS = new Map([
  ['steps', { top: 20, height: 44 }],
  ['video', { top: 64, height: 44 }],
]);

describe('targetHitsOf', () => {
  it('places edges over the full height and spans over their lane, the active one selected', () => {
    expect(
      targetHitsOf(
        [
          { key: 'start', seconds: 2 },
          { key: 'border', seconds: 10, lane: 'steps' },
          { key: 'take', seconds: 4, until: 9, lane: 'video' },
        ],
        -100,
        40,
        200,
        BANDS,
        'border',
      ),
    ).toEqual([
      { id: 'start', x: -21, y: 0, width: 2, height: 200, priority: 1, selected: false },
      { id: 'border', x: 299, y: 20, width: 2, height: 44, priority: 1, selected: true },
      { id: 'take', x: 60, y: 64, width: 200, height: 44, priority: 0, selected: false },
    ]);
  });

  it('leaves out a target whose lane is not on screen', () => {
    expect(
      targetHitsOf([{ key: 'key', seconds: 1, lane: 'keys' }], 0, 40, 200, BANDS, null),
    ).toEqual([]);
  });
});

describe('pickCentreTarget', () => {
  const targets = [
    { key: 'step', seconds: 0, until: 10, lane: 'steps', movable: false, tappable: true },
    { key: 'border', seconds: 10, lane: 'steps' },
    { key: 'take', seconds: 0, until: 10, lane: 'video', tappable: true },
  ];
  const hits = targetHitsOf(targets, 0, 40, 200, BANDS, null);

  it.each([
    { point: { x: 398, y: 40 }, use: 'drag' as const, expected: 'border' },
    { point: { x: 398, y: 40 }, use: 'tap' as const, expected: 'step' },
    { point: { x: 100, y: 40 }, use: 'drag' as const, expected: null },
    { point: { x: 100, y: 80 }, use: 'drag' as const, expected: 'take' },
    { point: { x: 100, y: 80 }, use: 'tap' as const, expected: 'take' },
    { point: { x: 100, y: 180 }, use: 'tap' as const, expected: null },
  ])('picks $expected for a $use at $point.x,$point.y', ({ point, use, expected }) => {
    expect(pickCentreTarget(targets, hits, point, use)?.key ?? null).toBe(expected);
  });
});
