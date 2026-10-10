import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type {
  GalleryPickPayload,
  NewsContentPayload,
  NewsCropPayload,
  NewsSavePayload,
} from './requests';
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
import type {
  CreatedNewsPost,
  GalleryAlbumPhotos,
  NewsHub,
  NewsMentionables,
  NewsPostDetails,
  NewsTieCandidates,
  PublishedNewsPost,
  SavedNewsPost,
} from './schemas';

export const NEWS_QUERY_KEY = ['news'] as const;
export const NEWS_HUB_QUERY_KEY = ['news', 'hub'] as const;
const NEWS_MENTIONABLES_QUERY_KEY = ['news', 'mentionables'] as const;
const NEWS_TIE_CANDIDATES_QUERY_KEY = ['news', 'tie-candidates'] as const;

const PROCESSING_POLL_MS = 3_000;

const galleryAlbumPhotosQueryKey = (albumId: number): readonly [string, string, number] => [
  'news',
  'gallery-album',
  albumId,
];

export const newsPostQueryKey = (newsPostId: number): readonly [string, string, number] => [
  'news',
  'post',
  newsPostId,
];

const isDeveloping = (post: NewsPostDetails | undefined): boolean =>
  post !== undefined &&
  [post.content.picture, post.pendingChanges?.picture].some(
    (picture) => picture?.state === 'processing',
  );

const refreshNews = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });

const refreshHub = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({ queryKey: NEWS_HUB_QUERY_KEY });

export const useNewsHubQuery = (): UseQueryResult<NewsHub, Error> =>
  useQuery({ queryKey: NEWS_HUB_QUERY_KEY, queryFn: () => withFreshAccessToken(requestNewsHub) });

export const useNewsPostQuery = (
  newsPostId: number | null,
): UseQueryResult<NewsPostDetails, Error> =>
  useQuery({
    queryKey: newsPostQueryKey(newsPostId ?? 0),
    queryFn:
      newsPostId === null
        ? skipToken
        : () => withFreshAccessToken((token) => requestNewsPost(newsPostId, token)),
    refetchOnWindowFocus: false,
    refetchInterval: (query) => (isDeveloping(query.state.data) ? PROCESSING_POLL_MS : false),
  });

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

export const useNewsPostCreation = (): UseMutationResult<
  CreatedNewsPost,
  Error,
  NewsContentPayload
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: NewsContentPayload) =>
      withFreshAccessToken((token) => requestNewsPostCreation(content, token)),
    onSettled: () => refreshHub(queryClient),
  });
};

export const useNewsPostSave = (): UseMutationResult<SavedNewsPost, Error, NewsSavePayload> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewsSavePayload) =>
      withFreshAccessToken((token) => requestNewsPostSave(payload, token)),
    onSettled: () => refreshHub(queryClient),
  });
};

export const useNewsPublication = (): UseMutationResult<PublishedNewsPost, Error, number> =>
  useNewsMutation(requestNewsPublication);

export const usePendingChangesPublication = (): UseMutationResult<
  PublishedNewsPost,
  Error,
  number
> => useNewsMutation(requestPendingChangesPublication);

export const usePendingChangesDiscard = (): UseMutationResult<void, Error, number> =>
  useNewsMutation(requestPendingChangesDiscard);

export const useNewsWithdrawal = (): UseMutationResult<void, Error, number> =>
  useNewsMutation(requestNewsWithdrawal);

export const useNewsPostDeletion = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newsPostId: number) =>
      withFreshAccessToken((token) => requestNewsPostDeletion(newsPostId, token)),
    onSuccess: (_, newsPostId) => {
      queryClient.removeQueries({ queryKey: newsPostQueryKey(newsPostId) });
    },
    onSettled: () => refreshHub(queryClient),
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

export const useNewsPostFetch = (): ((newsPostId: number) => Promise<NewsPostDetails>) => {
  const queryClient = useQueryClient();
  return (newsPostId: number) =>
    queryClient.fetchQuery({
      queryKey: newsPostQueryKey(newsPostId),
      queryFn: () => withFreshAccessToken((token) => requestNewsPost(newsPostId, token)),
      staleTime: 0,
    });
};
