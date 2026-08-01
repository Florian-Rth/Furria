import { describe, expect, it } from 'vitest';
import { resolveStepTransition } from './step-motion';

describe('resolveStepTransition', () => {
  it('swaps the question instantly when reduced motion is preferred', () => {
    expect(resolveStepTransition(true)).toEqual({ duration: 0 });
  });

  it('fades the next question in when motion is allowed', () => {
    expect(resolveStepTransition(false)).toMatchObject({ ease: 'easeOut' });
  });

  it('treats an unknown preference as motion-allowed', () => {
    expect(resolveStepTransition(null)).toMatchObject({ ease: 'easeOut' });
  });
});
