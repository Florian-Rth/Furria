import type { MutationFunctionContext, QueryClient } from '@tanstack/react-query';
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
    staleQueryKeysAfter(changes).map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
};

export const refreshAfterWrite = async ({
  client,
  meta,
}: MutationFunctionContext): Promise<void> => {
  if (meta?.changes === undefined) {
    return;
  }

  const refreshing = refreshAfter(client, meta.changes);

  if (meta.settlesWhenFresh === true) {
    await refreshing;
  }
};
