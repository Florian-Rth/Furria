import type { KkNoticePublisher, KkNoticeRequest } from '@furria/ui/KkNotice';
import type { MutationKey, MutationOptions, QueryClient, QueryKey } from '@tanstack/react-query';
import { hashKey, onlineManager } from '@tanstack/react-query';
import type { DomainChange } from '@/lib/query/reads';
import { OfflineWriteError } from './offline-write-error';
import type { OptimisticPatch } from './optimistic-patch';
import { closePatch, openPatch } from './optimistic-patch';

export type MutationKeys<TInput> = readonly QueryKey[] | ((input: TInput) => readonly QueryKey[]);

export interface ApiMutationNotice<TInput, TResult> {
  success?: (input: TInput, result: TResult) => string | KkNoticeRequest;
  failure?: (error: Error, input: TInput) => string | KkNoticeRequest | null;
}

export interface ApiMutation<TInput, TResult> {
  request: (input: TInput, accessToken: string) => Promise<TResult>;
  changes: readonly DomainChange[];
  optimistic?: readonly OptimisticPatch<TInput>[];
  forgets?: MutationKeys<TInput>;
  notice?: ApiMutationNotice<TInput, TResult>;
  afterSuccess?: (result: TResult, input: TInput) => void;
  key?: MutationKey;
}

export type Authorize = <TResult>(
  call: (accessToken: string) => Promise<TResult>,
) => Promise<TResult>;

export interface ApiMutationRuntime {
  queryClient: QueryClient;
  raiseNotice: KkNoticePublisher;
  authorize: Authorize;
}

type OpenedPatches<TInput> = readonly OptimisticPatch<TInput>[];

const keysFor = <TInput>(
  keys: MutationKeys<TInput> | undefined,
  input: TInput,
): readonly QueryKey[] => (typeof keys === 'function' ? keys(input) : (keys ?? []));

const toNotice = (
  notice: string | KkNoticeRequest,
  tone: KkNoticeRequest['tone'],
): KkNoticeRequest => (typeof notice === 'string' ? { tone, message: notice } : notice);

const isHeldOffline = (): boolean => !onlineManager.isOnline();

export const toApiMutationOptions = <TInput, TResult>(
  { queryClient, raiseNotice, authorize }: ApiMutationRuntime,
  definition: ApiMutation<TInput, TResult>,
): MutationOptions<TResult, Error, TInput, OpenedPatches<TInput>> => {
  const { request, changes, optimistic = [], forgets, notice, afterSuccess, key } = definition;

  return {
    mutationKey: key,
    meta: { changes, settlesWhenFresh: true },
    scope: key === undefined ? undefined : { id: hashKey(key) },
    networkMode: 'always',
    mutationFn: (input) =>
      isHeldOffline()
        ? Promise.reject(new OfflineWriteError())
        : authorize((accessToken) => request(input, accessToken)),
    onMutate: async (input) => {
      const opened = isHeldOffline() ? [] : optimistic;

      await Promise.all(opened.map((patch) => openPatch(queryClient, patch, input)));

      return opened;
    },
    onSuccess: (result, input) => {
      for (const queryKey of keysFor(forgets, input)) {
        queryClient.removeQueries({ queryKey, exact: true });
      }
      if (notice?.success !== undefined) {
        raiseNotice(toNotice(notice.success(input, result), 'success'));
      }
      afterSuccess?.(result, input);
    },
    onError: (error, input) => {
      const failure = notice?.failure?.(error, input) ?? null;

      if (failure !== null) {
        raiseNotice(toNotice(failure, 'error'));
      }
    },
    onSettled: async (_result, error, input, opened) => {
      const closed = (opened ?? []).filter((patch) =>
        closePatch(queryClient, patch, input, error === null),
      );

      await Promise.all(
        closed.map((patch) => queryClient.invalidateQueries({ queryKey: patch.key })),
      );
    },
  };
};
