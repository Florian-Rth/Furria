import { describe, expect, it } from 'vitest';
import type { SeasonLoopOutcome } from './season-content';
import { resolveLoopOutcome } from './season-content';

describe('resolveLoopOutcome', () => {
  it.each<[number, SeasonLoopOutcome]>([
    [1, 'loop'],
    [2, 'loop'],
    [3, 'diagnosis'],
    [4, 'loop'],
  ])('answers loop number %i with %s', (loopCount, outcome) => {
    expect(resolveLoopOutcome(loopCount)).toBe(outcome);
  });
});
