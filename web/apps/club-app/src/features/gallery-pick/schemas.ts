import { z } from 'zod';
import { MediaItemStateSchema, MediaUrlSchema } from '@/lib/api/schemas';

export const GalleryPhotoSchema = z.object({
  mediaItemId: z.number().int(),
  kind: z.enum(['photo', 'video']),
  state: MediaItemStateSchema,
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  urls: z.object({ small: MediaUrlSchema }),
});
export type GalleryPhoto = z.infer<typeof GalleryPhotoSchema>;

export const GalleryAlbumPhotosSchema = z.object({ items: z.array(GalleryPhotoSchema) });
export type GalleryAlbumPhotos = z.infer<typeof GalleryAlbumPhotosSchema>;

export const PickableAlbumsSchema = z.object({
  sections: z.array(
    z.object({
      albums: z.array(
        z.object({ albumId: z.number().int(), title: z.string(), photos: z.number().int() }),
      ),
    }),
  ),
});
export type PickableAlbums = z.infer<typeof PickableAlbumsSchema>;
