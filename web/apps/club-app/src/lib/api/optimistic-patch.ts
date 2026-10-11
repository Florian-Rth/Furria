import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { hashKey } from '@tanstack/react-query';

export interface OptimisticPatch<TInput> {
  readonly key: QueryKey;
  readonly capture: (queryClient: QueryClient) => () => void;
  readonly write: (queryClient: QueryClient, input: TInput) => void;
}

export const optimisticPatch = <TData, TInput>(
  key: QueryKey,
  apply: (current: TData | undefined, input: TInput) => TData | undefined,
): OptimisticPatch<TInput> => ({
  key,
  capture: (queryClient) => {
    const previous = queryClient.getQueryData<TData>(key);

    return () => {
      queryClient.setQueryData<TData>(key, previous);
    };
  },
  write: (queryClient, input) => {
    queryClient.setQueryData<TData>(key, (current) => apply(current, input));
  },
});

interface OpenPatches {
  pending: number;
  failed: boolean;
  restore: () => void;
  confirmed: (() => void)[];
}

const openPatchesByClient = new WeakMap<QueryClient, Map<string, OpenPatches>>();

const openPatchesOf = (queryClient: QueryClient): Map<string, OpenPatches> => {
  const known = openPatchesByClient.get(queryClient);

  if (known !== undefined) {
    return known;
  }

  const created = new Map<string, OpenPatches>();
  openPatchesByClient.set(queryClient, created);

  return created;
};

export const openPatch = async <TInput>(
  queryClient: QueryClient,
  patch: OptimisticPatch<TInput>,
  input: TInput,
): Promise<void> => {
  await queryClient.cancelQueries({ queryKey: patch.key });
  const open = openPatchesOf(queryClient);
  const id = hashKey(patch.key);
  const patches = open.get(id) ?? {
    pending: 0,
    failed: false,
    restore: patch.capture(queryClient),
    confirmed: [],
  };

  patches.pending += 1;
  open.set(id, patches);
  patch.write(queryClient, input);
};

export const closePatch = <TInput>(
  queryClient: QueryClient,
  patch: OptimisticPatch<TInput>,
  input: TInput,
  succeeded: boolean,
): boolean => {
  const open = openPatchesOf(queryClient);
  const id = hashKey(patch.key);
  const patches = open.get(id);

  if (patches === undefined) {
    return true;
  }

  if (succeeded) {
    patches.confirmed.push(() => {
      patch.write(queryClient, input);
    });
  } else {
    patches.failed = true;
  }

  patches.pending -= 1;

  if (patches.pending > 0) {
    return false;
  }

  open.delete(id);

  if (patches.failed) {
    patches.restore();
    for (const replay of patches.confirmed) {
      replay();
    }
  }

  return true;
};
