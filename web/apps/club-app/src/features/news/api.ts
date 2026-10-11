import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type { NewsDraftRequests } from './news-draft-session';
import type { GalleryPickPayload, NewsCropPayload } from './requests';
import {
  requestGalleryAlbumPhotos,
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
import type { GalleryAlbumPhotos, NewsHub, NewsMentionables, NewsTieCandidates } from './schemas';

export const NEWS_QUERY_KEY = ['news'] as const;
export const NEWS_HUB_QUERY_KEY = ['news', 'hub'] as const;
const NEWS_MENTIONABLES_QUERY_KEY = ['news', 'mentionables'] as const;
const NEWS_TIE_CANDIDATES_QUERY_KEY = ['news', 'tie-candidates'] as const;

const galleryAlbumPhotosQueryKey = (albumId: number): readonly [string, string, number] => [
  'news',
  'gallery-album',
  albumId,
];

const refreshNews = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });

const refreshHub = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: NEWS_HUB_QUERY_KEY });

export const useNewsHubQuery = (): UseQueryResult<NewsHub, Error> =>
  useQuery({ queryKey: NEWS_HUB_QUERY_KEY, queryFn: () => withFreshAccessToken(requestNewsHub) });

export const useNewsMentionablesQuery = (): UseQueryResult<NewsMentionables, Error> =>
  useQuery({
    queryKey: NEWS_MENTIONABLES_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestNewsMentionables),
  });

export const useNewsTieCandidatesQuery = (
  enabled: boolean,
): UseQueryResult<NewsTieCandidates, Error> =>
  useQuery({
    queryKey: NEWS_TIE_CANDIDATES_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestNewsTieCandidates),
    enabled,
  });

const useNewsMutation = <TInput, TResult>(
  write: (input: TInput, accessToken: string) => Promise<TResult>,
): UseMutationResult<TResult, Error, TInput> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => withFreshAccessToken((token) => write(input, token)),
    onSettled: () => refreshNews(queryClient),
  });
};

export const useNewsPictureCrop = (): UseMutationResult<void, Error, NewsCropPayload> =>
  useNewsMutation(requestNewsPictureCrop);

export const useNewsPictureRemoval = (): UseMutationResult<void, Error, number> =>
  useNewsMutation(requestNewsPictureRemoval);

export const useNewsPictureFromGallery = (): UseMutationResult<void, Error, GalleryPickPayload> =>
  useNewsMutation(requestNewsPictureFromGallery);

export const useGalleryAlbumPhotosQuery = (
  albumId: number,
  enabled: boolean,
): UseQueryResult<GalleryAlbumPhotos, Error> =>
  useQuery({
    queryKey: galleryAlbumPhotosQueryKey(albumId),
    queryFn: () => withFreshAccessToken((token) => requestGalleryAlbumPhotos(albumId, token)),
    enabled,
  });

const refreshingAfter = <T>(work: Promise<T>, refresh: () => Promise<void>): Promise<T> =>
  work.finally(() => {
    void refresh();
  });

export const newsDraftRequestsOf = (queryClient: QueryClient): NewsDraftRequests => {
  const hubAfter = <T>(work: Promise<T>): Promise<T> =>
    refreshingAfter(work, () => refreshHub(queryClient));
  const newsAfter = <T>(work: Promise<T>): Promise<T> =>
    refreshingAfter(work, () => refreshNews(queryClient));
  return {
    read: (newsPostId) => withFreshAccessToken((token) => requestNewsPost(newsPostId, token)),
    create: (content) =>
      hubAfter(withFreshAccessToken((token) => requestNewsPostCreation(content, token))),
    save: (payload) =>
      hubAfter(withFreshAccessToken((token) => requestNewsPostSave(payload, token))),
    publish: (newsPostId) =>
      newsAfter(withFreshAccessToken((token) => requestNewsPublication(newsPostId, token))),
    publishChanges: (newsPostId) =>
      newsAfter(
        withFreshAccessToken((token) => requestPendingChangesPublication(newsPostId, token)),
      ),
    discardChanges: (newsPostId) =>
      newsAfter(withFreshAccessToken((token) => requestPendingChangesDiscard(newsPostId, token))),
    withdraw: (newsPostId) =>
      newsAfter(withFreshAccessToken((token) => requestNewsWithdrawal(newsPostId, token))),
    remove: (newsPostId) =>
      hubAfter(withFreshAccessToken((token) => requestNewsPostDeletion(newsPostId, token))),
  };
};
