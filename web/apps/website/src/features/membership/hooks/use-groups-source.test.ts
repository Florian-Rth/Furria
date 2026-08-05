import { describe, expect, it } from 'vitest';
import { SEEDED_GROUPS } from '@/lib/seed/groups';
import { resolveGroupsSource, selectLoadedGroups } from './use-groups-source';

describe('resolveGroupsSource', () => {
  it('waits while the Gruppen are still on their way', () => {
    expect(resolveGroupsSource(undefined, false)).toEqual({ status: 'loading' });
  });

  it('admits a failed request', () => {
    expect(resolveGroupsSource(undefined, true)).toEqual({ status: 'error' });
  });

  it('hands over the Gruppen once they arrived', () => {
    expect(resolveGroupsSource(SEEDED_GROUPS, false)).toEqual({
      status: 'ready',
      groups: SEEDED_GROUPS,
    });
  });

  it('keeps the Gruppen it already has, even after a later failure', () => {
    expect(resolveGroupsSource(SEEDED_GROUPS, true).status).toBe('ready');
  });
});

describe('selectLoadedGroups', () => {
  it('has no Gruppen to offer while loading or after a failure', () => {
    expect(selectLoadedGroups({ status: 'loading' })).toEqual([]);
    expect(selectLoadedGroups({ status: 'error' })).toEqual([]);
  });

  it('unwraps the loaded Gruppen', () => {
    expect(selectLoadedGroups({ status: 'ready', groups: SEEDED_GROUPS })).toEqual(SEEDED_GROUPS);
  });
});
