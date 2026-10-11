import { describe, expect, it } from 'vitest';
import type { LandingNavigation, WriteLanding } from './landing-target';
import { toLandingNavigation } from './landing-target';

describe('toLandingNavigation', () => {
  it.each<{ label: string; landing: WriteLanding; expected: LandingNavigation }>([
    {
      label: 'a plain return that leaves the search alone',
      landing: { to: '/groups/$groupId', params: { groupId: 4 } },
      expected: { to: '/groups/$groupId', params: { groupId: '4' }, search: undefined },
    },
    {
      label: 'a marked landing that names the changed row',
      landing: {
        to: '/manage/venues/$venueId',
        params: { venueId: 12 },
        mark: { kind: 'venue', id: 12 },
      },
      expected: {
        to: '/manage/venues/$venueId',
        params: { venueId: '12' },
        search: { changed: 'venue:12' },
      },
    },
    {
      label: 'a marked landing that keeps the target search beside the mark',
      landing: { to: '/manage/roles', search: { role: 3 }, mark: { kind: 'role-holding', id: 9 } },
      expected: { to: '/manage/roles', params: {}, search: { role: 3, changed: 'role-holding:9' } },
    },
    {
      label: 'an unmarked landing with a target search',
      landing: { to: '/manage/roles', search: { role: 3 } },
      expected: { to: '/manage/roles', params: {}, search: { role: 3 } },
    },
  ])('resolves $label', ({ landing, expected }) => {
    expect(toLandingNavigation(landing)).toEqual(expected);
  });
});
