import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import type { AlbumFilter } from './requests';
import {
  requestAlbum,
  requestAlbumCreation,
  requestAlbumDeletion,
  requestAlbumRestoration,
  requestAlbumUpdate,
  requestBin,
  requestGalleryHub,
  requestInbox,
  requestInboxes,
  requestItemDeletion,
  requestItemRestoration,
  requestPlacement,
  requestPublication,
  requestSelection,
  requestUnpublication,
} from './requests';
import type {
  AlbumDetails,
  CreatedAlbum,
  GalleryBin,
  GalleryHub,
  InboxesResponse,
  InboxResponse,
} from './schemas';
import type { AlbumPayload, AlbumUpdatePayload, InboxOwner, SelectionPhoto } from './types';
import type { DevelopedItem } from './upload/upload-tiles';

const PROCESSING_POLL_MS = 4_000;

const isProcessing = (items: readonly { state: string }[] | undefined): boolean =>
  items?.some((item) => item.state === 'processing') ?? false;

export const useGalleryHubQuery = (): UseQueryResult<GalleryHub, Error> =>
  useQuery({
    queryKey: queryKeys.galleryHub,
    queryFn: () => withFreshAccessToken(requestGalleryHub),
  });

const albumQueryOptions = (albumId: number, filter: AlbumFilter) =>
  queryOptions({
    queryKey: queryKeys.album(albumId, filter),
    queryFn: () => withFreshAccessToken((token) => requestAlbum(albumId, filter, token)),
    refetchInterval: (query) =>
      isProcessing(query.state.data?.items) ? PROCESSING_POLL_MS : false,
  });

const inboxQueryOptions = (owner: InboxOwner) =>
  queryOptions({
    queryKey: queryKeys.inbox(owner),
    queryFn: () => withFreshAccessToken((token) => requestInbox(owner, token)),
    refetchInterval: (query) =>
      isProcessing(query.state.data?.items) ? PROCESSING_POLL_MS : false,
  });

export const useAlbumQuery = (
  albumId: number,
  filter: AlbumFilter,
  enabled = true,
): UseQueryResult<AlbumDetails, Error> =>
  useQuery({ ...albumQueryOptions(albumId, filter), enabled, placeholderData: keepPreviousData });

export const useInboxQuery = (
  owner: InboxOwner,
  enabled: boolean,
): UseQueryResult<InboxResponse, Error> => useQuery({ ...inboxQueryOptions(owner), enabled });

const UNFILTERED: AlbumFilter = { kind: null, uploaderPersonId: null };

export const useDevelopedItems = (
  targets: readonly (number | null)[],
): Map<number, DevelopedItem> =>
  useQueries({
    queries: targets.map((albumId) =>
      albumId === null
        ? inboxQueryOptions({ kind: 'mine' })
        : albumQueryOptions(albumId, UNFILTERED),
    ),
    combine: (results) =>
      new Map(
        results.flatMap((result) =>
          (result.data?.items ?? []).map((item): [number, DevelopedItem] => [
            item.mediaItemId,
            { state: item.state, source: item.urls.small },
          ]),
        ),
      ),
  });

export const useInboxesQuery = (enabled: boolean): UseQueryResult<InboxesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.inboxes,
    queryFn: () => withFreshAccessToken(requestInboxes),
    enabled,
  });

export const useGalleryBinQuery = (): UseQueryResult<GalleryBin, Error> =>
  useQuery({
    queryKey: queryKeys.galleryBin,
    queryFn: () => withFreshAccessToken(requestBin),
  });

const useGalleryMutation = <TInput, TResult>(
  write: (input: TInput, accessToken: string) => Promise<TResult>,
): UseMutationResult<TResult, Error, TInput> => {
  return useMutation({
    meta: { changes: ['media'], settlesWhenFresh: true },
    mutationFn: (input: TInput) => withFreshAccessToken((token) => write(input, token)),
  });
};

export interface AlbumUpdateInput {
  albumId: number;
  payload: AlbumUpdatePayload;
}

export interface SelectionInput {
  albumId: number;
  photos: readonly SelectionPhoto[];
}

export interface PlacementInput {
  albumId: number;
  mediaItemIds: readonly number[];
}

export const useAlbumCreation = (): UseMutationResult<CreatedAlbum, Error, AlbumPayload> =>
  useGalleryMutation(requestAlbumCreation);

export const useAlbumUpdate = (): UseMutationResult<void, Error, AlbumUpdateInput> =>
  useGalleryMutation(({ albumId, payload }: AlbumUpdateInput, token) =>
    requestAlbumUpdate(albumId, payload, token),
  );

export const useAlbumDeletion = (): UseMutationResult<void, Error, number> =>
  useGalleryMutation(requestAlbumDeletion);

export const useAlbumRestoration = (): UseMutationResult<void, Error, number> =>
  useGalleryMutation(requestAlbumRestoration);

export const useSelectionWrite = (): UseMutationResult<void, Error, SelectionInput> =>
  useGalleryMutation(({ albumId, photos }: SelectionInput, token) =>
    requestSelection(albumId, photos, token),
  );

export const usePublication = (): UseMutationResult<void, Error, number> =>
  useGalleryMutation(requestPublication);

export const useUnpublication = (): UseMutationResult<void, Error, number> =>
  useGalleryMutation(requestUnpublication);

export const usePlacement = (): UseMutationResult<void, Error, PlacementInput> =>
  useGalleryMutation(({ albumId, mediaItemIds }: PlacementInput, token) =>
    requestPlacement(albumId, mediaItemIds, token),
  );

export const useItemDeletion = (): UseMutationResult<void, Error, readonly number[]> =>
  useGalleryMutation(requestItemDeletion);

export const useItemRestoration = (): UseMutationResult<void, Error, readonly number[]> =>
  useGalleryMutation(requestItemRestoration);

export const useFullAlbumFetch = (): ((albumId: number) => Promise<AlbumDetails>) => {
  const queryClient = useQueryClient();
  return (albumId: number) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.album(albumId, UNFILTERED),
      queryFn: () => withFreshAccessToken((token) => requestAlbum(albumId, UNFILTERED, token)),
    });
};
