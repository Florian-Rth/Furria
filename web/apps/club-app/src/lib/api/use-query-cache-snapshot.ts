import { useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

export const useQueryCacheSnapshot = <TSnapshot>(read: () => TSnapshot): TSnapshot => {
  const queryClient = useQueryClient();
  const subscribe = (onChange: () => void): (() => void) =>
    queryClient.getQueryCache().subscribe(onChange);
  return useSyncExternalStore(subscribe, read, read);
};
