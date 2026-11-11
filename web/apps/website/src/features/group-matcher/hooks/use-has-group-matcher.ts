import { useGroupMatcherSource } from './use-group-matcher-source';

export const useHasGroupMatcher = (): boolean => useGroupMatcherSource()?.status === 'ready';
