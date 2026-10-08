import { describe, expect, it } from 'vitest';
import type { CycleTint } from './tint-cycle';
import { cycleTintAt } from './tint-cycle';

describe('cycleTintAt', () => {
  it.each<[number, CycleTint]>([
    [0, 'red'],
    [1, 'gold'],
    [2, 'ink'],
    [3, 'red'],
  ])('tints position %i %s', (index, tint) => {
    expect(cycleTintAt(index)).toBe(tint);
  });
});
