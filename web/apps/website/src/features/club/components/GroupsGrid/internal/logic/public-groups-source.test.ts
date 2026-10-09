import { describe, expect, it } from 'vitest';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import { resolvePublicGroupsSource } from './public-groups-source';

const retry = (): void => {};

const groups: PublicGroup[] = [
  {
    groupId: 1,
    name: 'Gruppe',
    picture: null,
    description: 'Beschreibung',
    isRecruiting: true,
    groupKindName: null,
    foundedYear: null,
    tone: null,
  },
];

describe('resolvePublicGroupsSource', () => {
  it.each<[string, PublicGroup[] | undefined, boolean, string]>([
    ['nothing arrived or failed yet', undefined, false, 'loading'],
    ['the request gave up', undefined, true, 'error'],
    ['a later refetch fails', groups, true, 'ready'],
    ['the club has no groups', [], false, 'ready'],
  ])('when %s the source is %s', (_, source, hasFailed, status) => {
    expect(resolvePublicGroupsSource(source, hasFailed, retry).status).toBe(status);
  });
});
