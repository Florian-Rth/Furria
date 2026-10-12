import type { MutationFunctionContext, MutationKey, QueryClient } from '@tanstack/react-query';
import { MutationCache, onlineManager } from '@tanstack/react-query';
import { hasOpenPatch } from '@/lib/api/optimistic-patch';
import type { DomainChange } from './reads';
import { staleQueryKeysAfter } from './reads';

export type WriteMeta = {
  changes?: readonly DomainChange[];
  settlesWhenFresh?: boolean;
};

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: WriteMeta;
  }
}

export const refreshAfter = async (
  queryClient: QueryClient,
  changes: readonly DomainChange[],
): Promise<void> => {
  await Promise.all(
    staleQueryKeysAfter(changes).map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
        predicate: (query) => !hasOpenPatch(queryClient, query.queryKey),
      }),
    ),
  );
};

const LAST_PENDING_WRITE = 1;

const isFollowedByLaterWrite = (
  client: QueryClient,
  mutationKey: MutationKey | undefined,
): boolean =>
  mutationKey !== undefined && client.isMutating({ mutationKey, exact: true }) > LAST_PENDING_WRITE;

export const refreshAfterWrite = async ({
  client,
  meta,
  mutationKey,
}: MutationFunctionContext): Promise<void> => {
  if (meta?.changes === undefined || isFollowedByLaterWrite(client, mutationKey)) {
    return;
  }

  const refreshing = refreshAfter(client, meta.changes);

  if (meta.settlesWhenFresh === true && onlineManager.isOnline()) {
    await refreshing;
  }
};

export const createWriteCache = (): MutationCache =>
  new MutationCache({
    onSettled: (_data, _error, _variables, _result, _mutation, context) =>
      refreshAfterWrite(context),
  });
