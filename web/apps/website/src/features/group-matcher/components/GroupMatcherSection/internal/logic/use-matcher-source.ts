import { useGroupMatcherQuery } from '@/features/group-matcher/api';
import type { GroupMatcher } from '@/lib/seed/group-matcher';

export type MatcherSource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; matcher: GroupMatcher };

export const resolveMatcherSource = (
  matcher: GroupMatcher | undefined,
  hasFailed: boolean,
  retry: () => void,
): MatcherSource => {
  if (matcher !== undefined) {
    return { status: 'ready', matcher };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};

export const useMatcherSource = (): MatcherSource => {
  const { data, isError, refetch } = useGroupMatcherQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolveMatcherSource(data, isError, retry);
};
