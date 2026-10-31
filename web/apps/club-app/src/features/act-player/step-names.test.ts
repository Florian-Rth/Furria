import { describe, expect, it } from 'vitest';
import type { StudioStep } from '@/features/acts/schemas';
import { shownStepNameOf, stepNumberOf } from './step-names';

const step = (stepId: number): StudioStep => ({
  stepId,
  name: '',
  description: null,
  startSeconds: stepId * 4,
  endSeconds: stepId * 4 + 4,
  placement: 'onTimeline',
});

describe('shownStepNameOf', () => {
  it.each([
    ['Einmarsch', 2, 'Einmarsch'],
    ['', 2, 'Schritt 2'],
    ['   ', 7, 'Schritt 7'],
  ])('shows %j as step %s named %j', (name, number, shown) => {
    expect(shownStepNameOf(name, number)).toBe(shown);
  });
});

describe('stepNumberOf', () => {
  it.each([
    [7, 1],
    [9, 2],
  ])('numbers step %s by its place in the dance as %s', (stepId, number) => {
    expect(stepNumberOf([step(7), step(9)], stepId)).toBe(number);
  });
});
