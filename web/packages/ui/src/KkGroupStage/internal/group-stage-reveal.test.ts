import { describe, expect, it } from 'vitest';
import { groupStageDelayOf } from './group-stage-reveal';

describe('groupStageDelayOf', () => {
  it.each([{ step: 2, expected: 0.36 }])(
    'staggers step $step by $expected seconds',
    ({ step, expected }) => {
      expect(groupStageDelayOf(step)).toBeCloseTo(expected);
    },
  );

  it('never pulls a step ahead of the first one', () => {
    expect(groupStageDelayOf(-4)).toBeCloseTo(groupStageDelayOf(0));
  });
});
