import { describe, expect, it } from 'vitest';
import type { StudioStep } from '@/features/acts/schemas';
import { hintVisitsOf, isHintedVisit, rememberedStepStartOf } from './practice-memory';

const step = (stepId: number, startSeconds: number | null): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds: startSeconds === null ? null : startSeconds + 8,
  placement: startSeconds === null ? 'cutAway' : 'onTimeline',
});

describe('rememberedStepStartOf', () => {
  const steps = [step(1, 0), step(2, 8), step(3, null)];

  it.each([
    ['2', 8],
    ['1', 0],
    [null, null],
    ['', null],
    ['nonsense', null],
    ['9', null],
    ['3', null],
  ])('starts the remembered step %o at %s', (stored, expected) => {
    expect(rememberedStepStartOf(steps, stored)).toBe(expected);
  });
});

describe('gesture hints', () => {
  it.each([
    [null, 0],
    ['', 0],
    ['nonsense', 0],
    ['-2', 0],
    ['1.5', 0],
    ['2', 2],
  ])('reads %o as %s earlier visits', (stored, visits) => {
    expect(hintVisitsOf(stored)).toBe(visits);
  });

  it.each([
    [0, true],
    [2, true],
    [3, false],
    [12, false],
  ])('after %s earlier visits hints: %s', (visits, hinted) => {
    expect(isHintedVisit(visits)).toBe(hinted);
  });
});
