import type { KkPhotoOrientation } from '@furria/ui/photo-frame';
import { z } from 'zod';
import { PictureSchema } from '@/lib/api/schemas';
import { SessionSectionSchema } from '@/lib/api/session-section';
import { WallClockSchema } from '@/lib/api/wall-clock';
import { toParagraphs } from '@/lib/paragraphs';

interface PhotoShape {
  aspect: number;
  orientation: KkPhotoOrientation;
}

const withPhotoShape = <T extends { width: number; height: number }>(photo: T): T & PhotoShape => ({
  ...photo,
  aspect: photo.width / photo.height,
  orientation: photo.height > photo.width ? 'portrait' : 'landscape',
});

const GalleryPhotoFieldsSchema = PictureSchema.extend({
  mediaItemId: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const GalleryPhotoSchema = GalleryPhotoFieldsSchema.transform(withPhotoShape);

export type GalleryPhoto = z.infer<typeof GalleryPhotoSchema>;

export const AlbumPhotoSchema = GalleryPhotoFieldsSchema.extend({
  caption: z.string().nullable(),
}).transform(withPhotoShape);

export type AlbumPhoto = z.infer<typeof AlbumPhotoSchema>;

const AlbumSummaryFieldsSchema = z.object({
  albumId: z.number().int().positive(),
  title: z.string().min(1),
  entryStartsAt: WallClockSchema.nullable(),
  photoCount: z.number().int().positive(),
  cover: GalleryPhotoSchema,
});

export const GallerySectionSchema = SessionSectionSchema({
  albums: z.array(AlbumSummaryFieldsSchema),
}).transform(({ session, albums }) => ({
  session,
  albums: albums.map((album) => ({ ...album, session })),
}));

export type GallerySection = z.infer<typeof GallerySectionSchema>;

export type AlbumSummary = GallerySection['albums'][number];

export const GalleryResponseSchema = z.object({
  sessions: z.array(GallerySectionSchema),
});

export const AlbumDetailSchema = SessionSectionSchema({
  albumId: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable(),
  entryStartsAt: WallClockSchema.nullable(),
  photos: z.array(AlbumPhotoSchema).min(1),
}).transform(({ description, ...album }) => ({
  ...album,
  paragraphs: toParagraphs(description),
}));

export type AlbumDetail = z.infer<typeof AlbumDetailSchema>;
