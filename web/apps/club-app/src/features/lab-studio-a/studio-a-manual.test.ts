import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import { bandsOf, manualOf } from './studio-a-manual';

const step = (
  stepId: number,
  startSeconds: number | null,
  endSeconds: number | null,
  placement: StudioStep['placement'] = 'onTimeline',
): StudioStep => ({
  stepId,
  name: 'Schritt',
  description: null,
  startSeconds,
  endSeconds,
  placement,
});

const part = (partId: number, stepIds: number[]): StudioPart => ({
  partId,
  name: 'Teil',
  stepIds,
  mainVideoId: null,
  adrift: false,
});

const timed = [step(1, 0, 10), step(2, 10, 20), step(3, 20, 30), step(4, 30, 40)];
const cut = step(5, null, null, 'cutAway');
const parts = [part(8, [3]), part(7, [1, 2]), part(9, [5])];

describe('manualOf', () => {
  it('groups numbered steps by part in music order, then loose and cut-away steps', () => {
    const groups = manualOf([...timed, cut], timed, parts);

    expect(
      groups.map((group) => [
        group.kind === 'part' ? group.part.partId : group.kind,
        group.steps.map((entry) => [entry.step.stepId, entry.number]),
      ]),
    ).toEqual([
      [
        7,
        [
          [1, 1],
          [2, 2],
        ],
      ],
      [8, [[3, 3]]],
      ['loose', [[4, 4]]],
      ['cutAway', [[5, 0]]],
    ]);
  });
});

describe('bandsOf', () => {
  it('lays parts over the music as shares of its length', () => {
    expect(bandsOf(parts, timed, 40)).toEqual([
      { partId: 8, name: 'Teil', from: 0.5, to: 0.75 },
      { partId: 7, name: 'Teil', from: 0, to: 0.5 },
    ]);
  });

  it('has no bands without music', () => {
    expect(bandsOf(parts, timed, 0)).toEqual([]);
  });
});
