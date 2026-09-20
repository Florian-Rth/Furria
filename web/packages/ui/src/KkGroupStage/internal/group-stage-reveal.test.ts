import { describe, expect, it } from 'vitest';
import { groupStageDelayOf } from './group-stage-reveal';

describe('groupStageDelayOf', () => {
  it.each([
    { step: 0, expected: 0.08 },
    { step: 1, expected: 0.22 },
    { step: 2, expected: 0.36 },
    { step: 3, expected: 0.5 },
  ])('staggers step $step by $expected seconds', ({ step, expected }) => {
    expect(groupStageDelayOf(step)).toBeCloseTo(expected);
  });

  it('never pulls a step ahead of the first one', () => {
    expect(groupStageDelayOf(-4)).toBeCloseTo(groupStageDelayOf(0));
  });
});
