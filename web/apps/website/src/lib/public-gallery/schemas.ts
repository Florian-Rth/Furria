import type { KkPhotoOrientation } from '@furria/ui';
import { z } from 'zod';
import { PictureSchema } from '@/lib/api/picture';
import type { Session } from '@/lib/club';
import { sessionStartingIn } from '@/lib/club';
import { toBerlinWallClock } from '@/lib/date';
import { toParagraphs } from '@/lib/paragraphs';

export interface GallerySession extends Session {
  number: number | null;
}

const toGallerySession = (startYear: number, number: number | null): GallerySession => ({
  ...sessionStartingIn(startYear),
  number,
});

const WallClockSchema = z.iso.datetime({ offset: true }).transform(toBerlinWallClock);

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

const GallerySessionFieldsSchema = z.object({
  sessionStartYear: z.number().int(),
  sessionNumber: z.number().int().positive().nullable(),
  albums: z.array(AlbumSummaryFieldsSchema),
});

export const GallerySectionSchema = GallerySessionFieldsSchema.transform(
  ({ sessionStartYear, sessionNumber, albums }) => {
    const session = toGallerySession(sessionStartYear, sessionNumber);
    return { session, albums: albums.map((album) => ({ ...album, session })) };
  },
);

export type GallerySection = z.infer<typeof GallerySectionSchema>;

export type AlbumSummary = GallerySection['albums'][number];

export const GalleryResponseSchema = z.object({
  sessions: z.array(GallerySectionSchema),
});

export const AlbumDetailSchema = z
  .object({
    albumId: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullable(),
    entryStartsAt: WallClockSchema.nullable(),
    sessionStartYear: z.number().int(),
    sessionNumber: z.number().int().positive().nullable(),
    photos: z.array(AlbumPhotoSchema).min(1),
  })
  .transform(({ description, sessionStartYear, sessionNumber, ...album }) => ({
    ...album,
    paragraphs: toParagraphs(description),
    session: toGallerySession(sessionStartYear, sessionNumber),
  }));

export type AlbumDetail = z.infer<typeof AlbumDetailSchema>;
