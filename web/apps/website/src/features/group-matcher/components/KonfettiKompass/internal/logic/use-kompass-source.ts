import { useGroupMatcherQuery } from '@/features/group-matcher/api';
import type { GroupMatcher } from '@/lib/seed/group-matcher';

export type KompassSource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; matcher: GroupMatcher };

export const resolveKompassSource = (
  matcher: GroupMatcher | undefined,
  hasFailed: boolean,
  retry: () => void,
): KompassSource => {
  if (matcher !== undefined) {
    return { status: 'ready', matcher };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};

export const useKompassSource = (): KompassSource => {
  const { data, isError, refetch } = useGroupMatcherQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolveKompassSource(data, isError, retry);
};
