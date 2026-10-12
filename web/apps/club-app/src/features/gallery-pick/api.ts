import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { pickableAlbumsOf } from './gallery-photo';
import { requestGalleryAlbumPhotos, requestPickableAlbums } from './requests';
import type { GalleryAlbumPhotos } from './schemas';
import type { PickableAlbum } from './types';

export const useGalleryAlbumPhotosQuery = (
  albumId: number,
  enabled: boolean,
): UseQueryResult<GalleryAlbumPhotos, Error> =>
  useQuery({
    queryKey: queryKeys.galleryPickAlbum(albumId),
    queryFn: () => withFreshAccessToken((token) => requestGalleryAlbumPhotos(albumId, token)),
    enabled,
  });

export const usePickableAlbumsQuery = (enabled: boolean): UseQueryResult<PickableAlbum[], Error> =>
  useQuery({
    queryKey: queryKeys.galleryPickAlbums,
    queryFn: () => withFreshAccessToken(requestPickableAlbums),
    select: pickableAlbumsOf,
    enabled,
  });
