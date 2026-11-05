import { describe, expect, it } from 'vitest';
import { nextId, nextIds } from './plan-ids';

describe('nextId', () => {
  it.each([
    [[], 'r1'],
    [['r1', 'r7', 'g9', 'rx', 'r03'], 'r8'],
  ])('continues after %o with %s', (existing, expected) => {
    expect(nextId('r', existing)).toBe(expected);
  });

  it('hands out several fresh ids in a row', () => {
    expect(nextIds('e', ['e2'], 3)).toEqual(['e3', 'e4', 'e5']);
  });
});
