import { describe, expect, it } from 'vitest';
import { blocksLeaving } from './leave-guard';

describe('blocksLeaving', () => {
  it.each<{ label: string; current: string; next: string; expected: boolean }>([
    {
      label: 'a search keystroke on the same route',
      current: '/groups/4/memberships/9',
      next: '/groups/4/memberships/9',
      expected: false,
    },
    {
      label: 'a sheet param change on the same route',
      current: '/groups/4',
      next: '/groups/4',
      expected: false,
    },
    {
      label: 'a navigation to a different route',
      current: '/groups/4/memberships/9',
      next: '/groups/4',
      expected: true,
    },
  ])('is $expected for $label', ({ current, next, expected }) => {
    expect(blocksLeaving({ pathname: current }, { pathname: next })).toBe(expected);
  });
});
