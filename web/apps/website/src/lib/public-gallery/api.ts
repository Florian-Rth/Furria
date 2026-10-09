import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import { shouldRetryPublicRead } from '@/lib/api/public-read-retry';
import { queryClient } from '@/lib/query-client';
import type { AlbumDetail, GallerySection } from './schemas';
import { AlbumDetailSchema, GalleryResponseSchema } from './schemas';

export const publicGalleryKeys = {
  all: ['public-gallery'] as const,
  album: (albumId: number): readonly ['public-gallery', number] =>
    ['public-gallery', albumId] as const,
};

const fetchPublicGallery = async (): Promise<GallerySection[]> => {
  const response = await apiFetch('/api/public/gallery', { schema: GalleryResponseSchema });
  return response.sessions;
};

const fetchPublicAlbum = (albumId: number): Promise<AlbumDetail> =>
  apiFetch(`/api/public/gallery/${albumId}`, { schema: AlbumDetailSchema });

export const usePublicGalleryQuery = (): UseQueryResult<GallerySection[], Error> =>
  useQuery({ queryKey: publicGalleryKeys.all, queryFn: fetchPublicGallery });

export const ensurePublicGallery = (): Promise<GallerySection[]> =>
  queryClient.ensureQueryData({ queryKey: publicGalleryKeys.all, queryFn: fetchPublicGallery });

export const ensurePublicAlbum = (albumId: number): Promise<AlbumDetail> =>
  queryClient.ensureQueryData({
    queryKey: publicGalleryKeys.album(albumId),
    queryFn: (): Promise<AlbumDetail> => fetchPublicAlbum(albumId),
    retry: shouldRetryPublicRead,
  });
