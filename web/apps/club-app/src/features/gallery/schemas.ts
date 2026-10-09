import { z } from 'zod';
import { MediaItemStateSchema, MediaUrlSchema } from '@/lib/api/schemas';

export const MediaKindSchema = z.enum(['photo', 'video']);
export type MediaKind = z.infer<typeof MediaKindSchema>;

export const GalleryMediaUrlsSchema = z.object({
  small: MediaUrlSchema,
  medium: MediaUrlSchema.nullable(),
  large: MediaUrlSchema.nullable(),
  poster: MediaUrlSchema.nullable(),
  video: MediaUrlSchema.nullable(),
  original: MediaUrlSchema,
  download: MediaUrlSchema,
});
export type GalleryMediaUrls = z.infer<typeof GalleryMediaUrlsSchema>;

export const GalleryMediaSchema = z.object({
  mediaItemId: z.int().positive(),
  kind: MediaKindSchema,
  state: MediaItemStateSchema,
  width: z.int().nullable(),
  height: z.int().nullable(),
  capturedAt: z.iso.datetime({ offset: true }).nullable(),
  urls: GalleryMediaUrlsSchema,
});
export type GalleryMedia = z.infer<typeof GalleryMediaSchema>;

export const GalleryHubAlbumSchema = z.object({
  albumId: z.int().positive(),
  title: z.string(),
  entryStartsAt: z.iso.datetime({ offset: true }).nullable(),
  sessionStartYear: z.int().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  isPublished: z.boolean(),
  photos: z.int().nonnegative(),
  videos: z.int().nonnegative(),
  selectionCount: z.int().nonnegative(),
  cover: GalleryMediaSchema.nullable(),
  samples: z.array(GalleryMediaSchema),
});
export type GalleryHubAlbum = z.infer<typeof GalleryHubAlbumSchema>;

export const GallerySectionSchema = z.object({
  sessionStartYear: z.int().nullable(),
  sessionNumber: z.int().nullable(),
  albums: z.array(GalleryHubAlbumSchema),
});
export type GallerySection = z.infer<typeof GallerySectionSchema>;

export const GalleryHubSchema = z.object({ sections: z.array(GallerySectionSchema) });
export type GalleryHub = z.infer<typeof GalleryHubSchema>;

export const GalleryUploaderSchema = z.object({
  personId: z.int().positive(),
  firstName: z.string(),
  lastName: z.string(),
});
export type GalleryUploader = z.infer<typeof GalleryUploaderSchema>;

const GalleryItemFields = {
  mediaItemId: z.int().positive(),
  kind: MediaKindSchema,
  state: MediaItemStateSchema,
  width: z.int().nullable(),
  height: z.int().nullable(),
  durationSeconds: z.number().nullable(),
  capturedAt: z.iso.datetime({ offset: true }).nullable(),
  uploadedAt: z.iso.datetime({ offset: true }),
  camera: z.string().nullable(),
  originalFileName: z.string(),
  urls: GalleryMediaUrlsSchema,
};

export const AlbumItemSchema = z.object({
  ...GalleryItemFields,
  uploader: GalleryUploaderSchema.nullable(),
  selectionPosition: z.int().nullable(),
  caption: z.string().nullable(),
});
export type AlbumItem = z.infer<typeof AlbumItemSchema>;

export const AlbumEntrySchema = z.object({
  calendarEntryId: z.int().positive(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
});
export type AlbumEntry = z.infer<typeof AlbumEntrySchema>;

export const AlbumUploaderCountSchema = z.object({
  uploader: GalleryUploaderSchema.nullable(),
  count: z.int().nonnegative(),
});
export type AlbumUploaderCount = z.infer<typeof AlbumUploaderCountSchema>;

export const AlbumDetailsSchema = z.object({
  albumId: z.int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  calendarEntry: AlbumEntrySchema.nullable(),
  sessionStartYear: z.int().nullable(),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  coverMediaItemId: z.int().nullable(),
  chosenCoverMediaItemId: z.int().nullable(),
  photos: z.int().nonnegative(),
  videos: z.int().nonnegative(),
  uploaders: z.array(AlbumUploaderCountSchema),
  items: z.array(AlbumItemSchema),
  zipUrl: MediaUrlSchema,
});
export type AlbumDetails = z.infer<typeof AlbumDetailsSchema>;

export const InboxItemSchema = z.object(GalleryItemFields);
export type InboxItem = z.infer<typeof InboxItemSchema>;

export const InboxResponseSchema = z.object({ items: z.array(InboxItemSchema) });
export type InboxResponse = z.infer<typeof InboxResponseSchema>;

export const InboxSummarySchema = z.object({
  uploader: GalleryUploaderSchema.nullable(),
  photos: z.int().nonnegative(),
  videos: z.int().nonnegative(),
  latestUploadedAt: z.iso.datetime({ offset: true }),
});
export type InboxSummary = z.infer<typeof InboxSummarySchema>;

export const InboxesResponseSchema = z.object({ inboxes: z.array(InboxSummarySchema) });
export type InboxesResponse = z.infer<typeof InboxesResponseSchema>;

export const BinnedAlbumSchema = z.object({
  albumId: z.int().positive(),
  title: z.string(),
  itemCount: z.int().nonnegative(),
  cover: GalleryMediaSchema.nullable(),
  binnedAt: z.iso.datetime({ offset: true }),
  purgesAt: z.iso.datetime({ offset: true }),
});
export type BinnedAlbum = z.infer<typeof BinnedAlbumSchema>;

export const BinnedItemSchema = z.object({
  item: GalleryMediaSchema,
  originalFileName: z.string(),
  albumId: z.int().positive(),
  albumTitle: z.string(),
  binnedAt: z.iso.datetime({ offset: true }),
  purgesAt: z.iso.datetime({ offset: true }),
});
export type BinnedItem = z.infer<typeof BinnedItemSchema>;

export const GalleryBinSchema = z.object({
  albums: z.array(BinnedAlbumSchema),
  items: z.array(BinnedItemSchema),
});
export type GalleryBin = z.infer<typeof GalleryBinSchema>;

export const CreatedAlbumSchema = z.object({ albumId: z.int().positive() });
export type CreatedAlbum = z.infer<typeof CreatedAlbumSchema>;

export const ALBUM_TITLE_MAX_LENGTH = 120;
export const ALBUM_DESCRIPTION_MAX_LENGTH = 2000;

export const AlbumLinkSchema = z.enum(['entry', 'session', 'none']);
export type AlbumLink = z.infer<typeof AlbumLinkSchema>;

export const AlbumFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Das Album braucht einen Titel.')
      .max(ALBUM_TITLE_MAX_LENGTH, `Höchstens ${ALBUM_TITLE_MAX_LENGTH} Zeichen.`),
    description: z
      .string()
      .max(ALBUM_DESCRIPTION_MAX_LENGTH, `Höchstens ${ALBUM_DESCRIPTION_MAX_LENGTH} Zeichen.`),
    link: AlbumLinkSchema,
    calendarEntryId: z.string(),
    sessionStartYear: z.int().nullable(),
    cover: z.string(),
  })
  .refine((form) => form.link !== 'entry' || form.calendarEntryId !== '', {
    path: ['calendarEntryId'],
    message: 'Wähle den Termin, zu dem das Album gehört.',
  })
  .refine((form) => form.link !== 'session' || form.sessionStartYear !== null, {
    path: ['sessionStartYear'],
    message: 'Wähle die Session, zu der das Album gehört.',
  });
export type AlbumForm = z.infer<typeof AlbumFormSchema>;

export const MEDIA_CAPTION_MAX_LENGTH = 300;
