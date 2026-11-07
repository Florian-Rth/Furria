import { describe, expect, it } from 'vitest';
import { nextStepOf } from './next-step';

describe('nextStepOf', () => {
  it.each([
    { stepId: 11, expected: { stepId: 12, number: 2 } },
    { stepId: 12, expected: { stepId: 13, number: 3 } },
    { stepId: 13, expected: null },
    { stepId: 99, expected: { stepId: 11, number: 1 } },
    { stepId: null, expected: { stepId: 11, number: 1 } },
  ])('finds the step after $stepId', ({ stepId, expected }) => {
    const steps = [11, 12, 13].map((id, index) => ({
      stepId: id,
      name: `Schritt ${id}`,
      startSeconds: index * 4,
      endSeconds: index * 4 + 4,
      placement: 'onTimeline' as const,
    }));

    const next = nextStepOf(steps, stepId);

    expect(next === null ? null : { stepId: next.step.stepId, number: next.number }).toEqual(
      expected,
    );
  });

  it('has no next step without steps', () => {
    expect(nextStepOf([], null)).toBeNull();
  });
});
