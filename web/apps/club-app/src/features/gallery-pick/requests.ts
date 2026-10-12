import { apiFetch } from '@/lib/api/api-fetch';
import type { GalleryAlbumPhotos, PickableAlbums } from './schemas';
import { GalleryAlbumPhotosSchema, PickableAlbumsSchema } from './schemas';

export const requestGalleryAlbumPhotos = (
  albumId: number,
  accessToken: string,
): Promise<GalleryAlbumPhotos> =>
  apiFetch(`/api/gallery/albums/${albumId}?kind=photo`, {
    schema: GalleryAlbumPhotosSchema,
    accessToken,
  });

export const requestPickableAlbums = (accessToken: string): Promise<PickableAlbums> =>
  apiFetch('/api/gallery', { schema: PickableAlbumsSchema, accessToken });
