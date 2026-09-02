import { describe, expect, it } from 'vitest';
import { buildJoinStepNumeral } from './steps-content';

describe('buildJoinStepNumeral', () => {
  it('numbers the steps from one and pads only the single digits', () => {
    expect(buildJoinStepNumeral(0)).toBe('01');
    expect(buildJoinStepNumeral(3)).toBe('04');
    expect(buildJoinStepNumeral(9)).toBe('10');
  });
});
