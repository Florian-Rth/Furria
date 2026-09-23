import { describe, expect, it } from 'vitest';
import { blocksLeaving } from './leave-guard';

describe('blocksLeaving', () => {
  it.each<{
    label: string;
    current: string;
    next: string;
    changed: string | undefined;
    expected: boolean;
  }>([
    {
      label: 'a search keystroke on the same route',
      current: '/groups/4/memberships/9',
      next: '/groups/4/memberships/9',
      changed: undefined,
      expected: false,
    },
    {
      label: 'a sheet param change on the same route',
      current: '/groups/4',
      next: '/groups/4',
      changed: undefined,
      expected: false,
    },
    {
      label: 'a navigation to a different route',
      current: '/groups/4/memberships/9',
      next: '/groups/4',
      changed: undefined,
      expected: true,
    },
    {
      label: 'the landing after a save',
      current: '/manage/persons/new',
      next: '/manage/persons/12',
      changed: 'person-12',
      expected: false,
    },
  ])('is $expected for $label', ({ current, next, changed, expected }) => {
    expect(
      blocksLeaving({ pathname: current, search: {} }, { pathname: next, search: { changed } }),
    ).toBe(expected);
  });
});
