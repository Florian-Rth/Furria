import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  keepPreviousData,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { useQueryCacheSnapshot } from '@/lib/api/use-query-cache-snapshot';
import { queryKeys } from '@/lib/query/reads';
import type { DevelopedItems } from './developing-items';
import { developedAfter, developingPollDelayOf, mergeItems, pollBatchOf } from './developing-items';
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
  requestItems,
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
  InboxItem,
  InboxResponse,
} from './schemas';
import type { AlbumPayload, AlbumUpdatePayload, InboxOwner, SelectionPhoto } from './types';
import type { UploadEntry } from './upload/upload-queue';
import { readUploads } from './upload/upload-store';
import type { DevelopedItem } from './upload/upload-tiles';
import { useUploads } from './upload/use-uploads';

export const useGalleryHubQuery = (): UseQueryResult<GalleryHub, Error> =>
  useQuery({
    queryKey: queryKeys.galleryHub,
    queryFn: () => withFreshAccessToken(requestGalleryHub),
  });

const albumQueryOptions = (albumId: number, filter: AlbumFilter) =>
  queryOptions({
    queryKey: queryKeys.album(albumId, filter),
    queryFn: () => withFreshAccessToken((token) => requestAlbum(albumId, filter, token)),
  });

const inboxQueryOptions = (owner: InboxOwner) =>
  queryOptions({
    queryKey: queryKeys.inbox(owner),
    queryFn: () => withFreshAccessToken((token) => requestInbox(owner, token)),
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

const NOTHING_DEVELOPED: DevelopedItems = new Map();

const developedOf = (queryClient: QueryClient): DevelopedItems =>
  queryClient.getQueryData<DevelopedItems>(queryKeys.galleryDeveloping) ?? NOTHING_DEVELOPED;

const cachedListsOf = (queryClient: QueryClient): (readonly InboxItem[])[] => [
  ...queryClient
    .getQueriesData<AlbumDetails>({ queryKey: queryKeys.albums })
    .map(([, album]) => album?.items ?? []),
  ...queryClient
    .getQueriesData<InboxResponse>({ queryKey: queryKeys.inboxesByOwner })
    .map(([, inbox]) => inbox?.items ?? []),
];

const pollDeveloping = async (
  queryClient: QueryClient,
  batch: readonly number[],
): Promise<DevelopedItems> => {
  const answer = await withFreshAccessToken((token) => requestItems(batch, token));
  queryClient.setQueriesData<AlbumDetails>({ queryKey: queryKeys.albums }, (album) =>
    album === undefined ? album : { ...album, items: mergeItems(album.items, batch, answer.items) },
  );
  queryClient.setQueriesData<InboxResponse>({ queryKey: queryKeys.inboxesByOwner }, (inbox) =>
    inbox === undefined ? inbox : { items: mergeItems(inbox.items, batch, answer.items) },
  );
  return developedAfter(developedOf(queryClient), batch, answer.items);
};

const uploadedIdsOf = (entries: readonly UploadEntry[]): number[] =>
  entries.flatMap((entry) =>
    entry.phase === 'sent' && entry.mediaItemId !== null ? [entry.mediaItemId] : [],
  );

const pollDelayOf = (queryClient: QueryClient): number =>
  developingPollDelayOf(
    cachedListsOf(queryClient),
    uploadedIdsOf(readUploads().entries),
    developedOf(queryClient),
  );

const batchOfKey = (batchKey: string): number[] =>
  batchKey === '' ? [] : batchKey.split(',').map(Number);

export const useDevelopingItems = (): void => {
  const queryClient = useQueryClient();
  const uploadedIds = uploadedIdsOf(useUploads().entries);
  const batchKey = useQueryCacheSnapshot(() =>
    pollBatchOf(cachedListsOf(queryClient), uploadedIds, developedOf(queryClient)).join(','),
  );
  const batch = batchOfKey(batchKey);

  useQuery({
    queryKey: queryKeys.galleryDeveloping,
    queryFn: () => pollDeveloping(queryClient, batch),
    enabled: batch.length > 0,
    refetchInterval: () => pollDelayOf(queryClient),
  });
};

export const useDevelopedItems = (): Map<number, DevelopedItem> => {
  const queryClient = useQueryClient();
  const developed = useQueryCacheSnapshot(() => developedOf(queryClient));
  return new Map(
    [...developed].flatMap(([mediaItemId, item]): [number, DevelopedItem][] =>
      item === null ? [] : [[mediaItemId, { state: item.state, source: item.urls.small }]],
    ),
  );
};

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
  request: (input: TInput, accessToken: string) => Promise<TResult>,
): UseMutationResult<TResult, Error, TInput> => useApiMutation({ request, changes: ['media'] });

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

export interface EntryAlbums {
  albums: AlbumDetails[];
  isPending: boolean;
  error: Error | null;
}

const isSameInstant = (left: string | null, right: string): boolean =>
  left !== null && new Date(left).getTime() === new Date(right).getTime();

export const useEntryAlbums = (
  calendarEntryId: number,
  startsAt: string,
  isEnabled: boolean,
): EntryAlbums => {
  const hub = useQuery({
    queryKey: queryKeys.galleryHub,
    queryFn: () => withFreshAccessToken(requestGalleryHub),
    enabled: isEnabled,
  });
  const candidates = (hub.data?.sections ?? [])
    .flatMap((section) => section.albums)
    .filter((album) => isSameInstant(album.entryStartsAt, startsAt));
  const details = useQueries({
    queries: candidates.map((album) => albumQueryOptions(album.albumId, UNFILTERED)),
  });
  const albums = details
    .map((query) => query.data)
    .filter(
      (album): album is AlbumDetails =>
        album !== undefined && album.calendarEntry?.calendarEntryId === calendarEntryId,
    );

  return {
    albums,
    isPending: (isEnabled && hub.isPending) || details.some((query) => query.isPending),
    error: hub.error ?? details.find((query) => query.error !== null)?.error ?? null,
  };
};
