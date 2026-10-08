import { useGroupMatcherQuery } from '@/features/group-matcher/api';
import type { MatcherSource } from './matcher-source';
import { resolveMatcherSource } from './matcher-source';

export const useMatcherSource = (): MatcherSource => {
  const { data, isError, refetch } = useGroupMatcherQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolveMatcherSource(data, isError, retry);
};
