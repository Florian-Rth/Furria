import { useQueryClient } from '@tanstack/react-query';
import type { DomainChange } from './reads';
import { refreshAfter } from './refresh-after';

export const useRefreshAfter = (): ((changes: readonly DomainChange[]) => Promise<void>) => {
  const queryClient = useQueryClient();

  return (changes) => refreshAfter(queryClient, changes);
};
