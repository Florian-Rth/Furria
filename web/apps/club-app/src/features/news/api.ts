import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { refreshPermissionsWhenForbidden } from '@/lib/query/permission-refresh';
import { queryKeys } from '@/lib/query/reads';
import { refreshAfter } from '@/lib/query/refresh-after';
import type { NewsDraftRequests } from './news-draft-session';
import type { GalleryPickPayload, NewsCropPayload } from './requests';
import {
  requestNewsHub,
  requestNewsMentionables,
  requestNewsPictureCrop,
  requestNewsPictureFromGallery,
  requestNewsPictureRemoval,
  requestNewsPost,
  requestNewsPostCreation,
  requestNewsPostDeletion,
  requestNewsPostSave,
  requestNewsPublication,
  requestNewsTieCandidates,
  requestNewsWithdrawal,
  requestPendingChangesDiscard,
  requestPendingChangesPublication,
} from './requests';
import type { NewsHub, NewsMentionables, NewsTieCandidates } from './schemas';

export const useNewsHubQuery = (): UseQueryResult<NewsHub, Error> =>
  useQuery({ queryKey: queryKeys.newsHub, queryFn: () => withFreshAccessToken(requestNewsHub) });

export const useNewsMentionablesQuery = (): UseQueryResult<NewsMentionables, Error> =>
  useQuery({
    queryKey: queryKeys.newsMentionables,
    queryFn: () => withFreshAccessToken(requestNewsMentionables),
  });

export const useNewsTieCandidatesQuery = (
  enabled: boolean,
): UseQueryResult<NewsTieCandidates, Error> =>
  useQuery({
    queryKey: queryKeys.newsTieCandidates,
    queryFn: () => withFreshAccessToken(requestNewsTieCandidates),
    enabled,
  });

const useNewsMutation = <TInput, TResult>(
  request: (input: TInput, accessToken: string) => Promise<TResult>,
): UseMutationResult<TResult, Error, TInput> => useApiMutation({ request, changes: ['newsPost'] });

export const useNewsPictureCrop = (): UseMutationResult<void, Error, NewsCropPayload> =>
  useNewsMutation(requestNewsPictureCrop);

export const useNewsPictureRemoval = (): UseMutationResult<void, Error, number> =>
  useNewsMutation(requestNewsPictureRemoval);

export const useNewsPictureFromGallery = (): UseMutationResult<void, Error, GalleryPickPayload> =>
  useNewsMutation(requestNewsPictureFromGallery);

const refreshingPermissionsWhenForbidden = <T>(
  queryClient: QueryClient,
  work: Promise<T>,
): Promise<T> =>
  work.catch((error: Error) => {
    refreshPermissionsWhenForbidden(queryClient, error);
    throw error;
  });

const refreshingAfter = <T>(queryClient: QueryClient, work: Promise<T>): Promise<T> =>
  refreshingPermissionsWhenForbidden(queryClient, work).finally(() => {
    void refreshAfter(queryClient, ['newsPost']);
  });

export const newsDraftRequestsOf = (queryClient: QueryClient): NewsDraftRequests => {
  const postAfter = <T>(work: Promise<T>): Promise<T> => refreshingAfter(queryClient, work);
  return {
    read: (newsPostId) =>
      refreshingPermissionsWhenForbidden(
        queryClient,
        withFreshAccessToken((token) => requestNewsPost(newsPostId, token)),
      ),
    create: (content) =>
      postAfter(withFreshAccessToken((token) => requestNewsPostCreation(content, token))),
    save: (payload) =>
      postAfter(withFreshAccessToken((token) => requestNewsPostSave(payload, token))),
    publish: (newsPostId) =>
      postAfter(withFreshAccessToken((token) => requestNewsPublication(newsPostId, token))),
    publishChanges: (newsPostId) =>
      postAfter(
        withFreshAccessToken((token) => requestPendingChangesPublication(newsPostId, token)),
      ),
    discardChanges: (newsPostId) =>
      postAfter(withFreshAccessToken((token) => requestPendingChangesDiscard(newsPostId, token))),
    withdraw: (newsPostId) =>
      postAfter(withFreshAccessToken((token) => requestNewsWithdrawal(newsPostId, token))),
    remove: (newsPostId) =>
      postAfter(withFreshAccessToken((token) => requestNewsPostDeletion(newsPostId, token))),
  };
};
