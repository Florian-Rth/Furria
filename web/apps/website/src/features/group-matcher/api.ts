import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { GroupMatcherSchema, SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';

export const groupMatcherKeys = {
  all: ['group-matcher'] as const,
};

const fetchGroupMatcher = (): Promise<GroupMatcher> =>
  Promise.resolve(GroupMatcherSchema.parse(SEEDED_GROUP_MATCHER));

export const useGroupMatcherQuery = (): UseQueryResult<GroupMatcher, Error> =>
  useQuery({ queryKey: groupMatcherKeys.all, queryFn: fetchGroupMatcher });
