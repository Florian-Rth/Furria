import { describe, expect, it } from 'vitest';
import { nextStepOf } from './lesson-next';

describe('nextStepOf', () => {
  it.each([
    { stepId: 11, expected: { stepId: 12, number: 2 } },
    { stepId: 12, expected: { stepId: 13, number: 3 } },
    { stepId: 13, expected: null },
    { stepId: 99, expected: null },
    { stepId: null, expected: null },
  ])('finds the step after $stepId', ({ stepId, expected }) => {
    const steps = [11, 12, 13].map((id, index) => ({
      stepId: id,
      name: `Schritt ${id}`,
      description: null,
      startSeconds: index * 4,
      endSeconds: index * 4 + 4,
      placement: 'onTimeline' as const,
    }));

    const next = nextStepOf(steps, stepId);

    expect(next === null ? null : { stepId: next.step.stepId, number: next.number }).toEqual(
      expected,
    );
  });
});
