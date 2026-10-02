import { describe, expect, it } from 'vitest';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import { resolveGroupsSource, selectLoadedGroups } from './use-groups-source';

const ROSTER: PublicGroup[] = [
  {
    groupId: 1,
    name: 'Tanzgarde',
    description: '',
    isRecruiting: true,
    groupKindName: null,
    foundedYear: null,
    tone: null,
  },
];

describe('resolveGroupsSource', () => {
  it('waits while the groups are still on their way', () => {
    expect(resolveGroupsSource(undefined, false)).toEqual({ status: 'loading' });
  });

  it('admits a failed request', () => {
    expect(resolveGroupsSource(undefined, true)).toEqual({ status: 'error' });
  });

  it('hands over the groups once they arrived', () => {
    expect(resolveGroupsSource(ROSTER, false)).toEqual({
      status: 'ready',
      groups: ROSTER,
    });
  });

  it('keeps the groups it already has, even after a later failure', () => {
    expect(resolveGroupsSource(ROSTER, true).status).toBe('ready');
  });
});

describe('selectLoadedGroups', () => {
  it('has no groups to offer while loading or after a failure', () => {
    expect(selectLoadedGroups({ status: 'loading' })).toEqual([]);
    expect(selectLoadedGroups({ status: 'error' })).toEqual([]);
  });

  it('unwraps the loaded groups', () => {
    expect(selectLoadedGroups({ status: 'ready', groups: ROSTER })).toEqual(ROSTER);
  });
});
