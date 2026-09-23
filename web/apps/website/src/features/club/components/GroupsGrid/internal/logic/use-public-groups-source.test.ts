import { describe, expect, it, vi } from 'vitest';
import type { PublicGroup } from '@/features/club/schemas';
import { resolvePublicGroupsSource } from './use-public-groups-source';

const retry = vi.fn();

const groups: PublicGroup[] = [
  { groupId: 1, name: 'Gruppe', description: 'Beschreibung', isRecruiting: true },
];

describe('resolvePublicGroupsSource', () => {
  it('waits while nothing has arrived and nothing has failed', () => {
    expect(resolvePublicGroupsSource(undefined, false, retry)).toEqual({ status: 'loading' });
  });

  it('reports the failure once the request has given up', () => {
    expect(resolvePublicGroupsSource(undefined, true, retry)).toEqual({
      status: 'error',
      retry,
    });
  });

  it('hands over the groups once they are there', () => {
    expect(resolvePublicGroupsSource(groups, false, retry)).toEqual({ status: 'ready', groups });
  });

  it('keeps showing the groups when a later refetch fails', () => {
    expect(resolvePublicGroupsSource(groups, true, retry)).toEqual({ status: 'ready', groups });
  });

  it('treats an empty club as ready, not as loading', () => {
    expect(resolvePublicGroupsSource([], false, retry)).toEqual({ status: 'ready', groups: [] });
  });
});
