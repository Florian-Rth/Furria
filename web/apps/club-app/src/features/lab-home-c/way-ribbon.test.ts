import { describe, expect, it } from 'vitest';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import { ribbonOf } from './way-ribbon';

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: `Step ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const steps: StudioStep[] = [step(1, 0, 8), step(2, 8, 24), step(3, 24, 28)];

const parts: StudioPart[] = [
  { partId: 9, name: 'Marsch', stepIds: [1, 2], mainVideoId: null, adrift: false },
];

const marks: CountMark[] = Array.from({ length: 56 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('ribbonOf', () => {
  it('groups the steps by part with the part first step', () => {
    const ribbon = ribbonOf(steps, parts, marks);

    expect(ribbon.map((group) => [group.partName, group.firstStepId])).toEqual([
      ['Marsch', 1],
      [null, 3],
    ]);
  });

  it.each([
    ['with counts', marks, [2, 4, 1]],
    ['without counts', [], [2, 4, 1]],
  ])('gives each step its eights %s', (_, given, eights) => {
    const ribbon = ribbonOf(steps, parts, given);

    expect(ribbon.flatMap((group) => group.tiles.map((tile) => tile.eights))).toEqual(eights);
  });

  it('gives a step shorter than an eight one eight', () => {
    const ribbon = ribbonOf([step(1, 0, 1)], [], marks);

    expect(ribbon[0]?.tiles[0]?.eights).toBe(1);
  });
});
