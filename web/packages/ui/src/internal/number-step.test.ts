import { describe, expect, it } from 'vitest';
import { canStep, stepNumber } from './number-step';

describe('stepNumber', () => {
  it.each([
    { value: '1950', delta: 1, bounds: {}, expected: '1951' },
    { value: ' 7 ', delta: -1, bounds: {}, expected: '6' },
    { value: '2026', delta: 1, bounds: { max: 2026 }, expected: '2026' },
    { value: '1', delta: -1, bounds: { min: 1 }, expected: '1' },
    { value: '', delta: 1, bounds: { min: 1 }, expected: '1' },
    { value: 'abc', delta: -1, bounds: { max: 2026 }, expected: '2026' },
    { value: '', delta: 1, bounds: {}, expected: '0' },
  ])('steps $value by $delta to $expected', ({ value, delta, bounds, expected }) => {
    expect(stepNumber(value, delta, bounds)).toBe(expected);
  });
});

describe('canStep', () => {
  it.each([
    { value: '2026', delta: 1, bounds: { max: 2026 }, expected: false },
    { value: '2025', delta: 1, bounds: { max: 2026 }, expected: true },
    { value: '1', delta: -1, bounds: { min: 1 }, expected: false },
    { value: '', delta: -1, bounds: { min: 1 }, expected: true },
    { value: '5', delta: 1, bounds: {}, expected: true },
  ])('decides $value by $delta as $expected', ({ value, delta, bounds, expected }) => {
    expect(canStep(value, delta, bounds)).toBe(expected);
  });
});
