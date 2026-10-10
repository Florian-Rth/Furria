import { z } from 'zod';
import {
  MediaItemStateSchema,
  MediaUrlSchema,
  PersonRefSchema,
  PictureEditingSchema,
  PictureSchema,
} from '@/lib/api/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

const InstantSchema = z.iso.datetime({ offset: true });

export const NewsCategorySchema = z.enum(['session', 'achievements', 'club', 'groups']);
export type NewsCategory = z.infer<typeof NewsCategorySchema>;

export const NewsPostStateSchema = z.enum(['draft', 'published', 'withdrawn']);
export type NewsPostState = z.infer<typeof NewsPostStateSchema>;

export const NewsRequirementSchema = z.enum(['category', 'title', 'teaser', 'text']);
export type NewsRequirement = z.infer<typeof NewsRequirementSchema>;

export const NewsPostSummarySchema = z.object({
  newsPostId: z.number().int(),
  title: z.string(),
  teaser: z.string(),
  category: NewsCategorySchema.nullable(),
  state: NewsPostStateSchema,
  hasPendingChanges: z.boolean(),
  slug: z.string().nullable(),
  publishedAt: InstantSchema.nullable(),
  withdrawnAt: InstantSchema.nullable(),
  pendingSavedAt: InstantSchema.nullable(),
  picture: PictureSchema.nullable(),
  missing: z.array(NewsRequirementSchema),
  updatedAt: InstantSchema,
  author: PersonRefSchema.nullable(),
});
export type NewsPostSummary = z.infer<typeof NewsPostSummarySchema>;

export const NewsSectionSchema = z.object({
  sessionStartYear: z.number().int().nullable(),
  sessionNumber: z.number().int().nullable(),
  posts: z.array(NewsPostSummarySchema),
});
export type NewsSection = z.infer<typeof NewsSectionSchema>;

export const NewsHubSchema = z.object({ sections: z.array(NewsSectionSchema) });
export type NewsHub = z.infer<typeof NewsHubSchema>;

export const NewsEventTieSchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: InstantSchema,
  endsAt: InstantSchema.nullable(),
  venueName: z.string().nullable(),
  isCancelled: z.boolean(),
});
export type NewsEventTie = z.infer<typeof NewsEventTieSchema>;

export const NewsAlbumTieSchema = z.object({
  albumId: z.number().int(),
  title: z.string(),
  isPublished: z.boolean(),
  photoCount: z.number().int(),
  cover: PictureSchema.nullable(),
});
export type NewsAlbumTie = z.infer<typeof NewsAlbumTieSchema>;

export const NewsPostVersionSchema = z.object({
  title: z.string(),
  teaser: z.string(),
  text: z.string(),
  category: NewsCategorySchema.nullable(),
  event: NewsEventTieSchema.nullable(),
  album: NewsAlbumTieSchema.nullable(),
  picture: PictureEditingSchema.nullable(),
  pictureCaption: z.string().nullable(),
});
export type NewsPostVersion = z.infer<typeof NewsPostVersionSchema>;

export const NewsPostDetailsSchema = z.object({
  newsPostId: z.number().int(),
  state: NewsPostStateSchema,
  slug: z.string().nullable(),
  publishedAt: InstantSchema.nullable(),
  withdrawnAt: InstantSchema.nullable(),
  author: PersonRefSchema.nullable(),
  lastSavedBy: PersonRefSchema.nullable(),
  revision: z.number().int(),
  updatedAt: InstantSchema,
  content: NewsPostVersionSchema,
  pendingSavedAt: InstantSchema.nullable(),
  pendingChanges: NewsPostVersionSchema.nullable(),
});
export type NewsPostDetails = z.infer<typeof NewsPostDetailsSchema>;

export const CreatedNewsPostSchema = z.object({ newsPostId: z.number().int() });
export type CreatedNewsPost = z.infer<typeof CreatedNewsPostSchema>;

export const ForeignSaveSchema = z.object({
  savedBy: PersonRefSchema.nullable(),
  savedAt: InstantSchema,
});
export type ForeignSave = z.infer<typeof ForeignSaveSchema>;

export const SavedNewsPostSchema = z.object({
  revision: z.number().int(),
  savedInBetween: ForeignSaveSchema.nullable(),
});
export type SavedNewsPost = z.infer<typeof SavedNewsPostSchema>;

export const PublishedNewsPostSchema = z.object({
  slug: z.string(),
  publishedAt: InstantSchema,
  revision: z.number().int(),
});
export type PublishedNewsPost = z.infer<typeof PublishedNewsPostSchema>;

export const PickedNewsPictureSchema = z.object({ mediaItemId: z.number().int() });

export const MentionableGroupSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  tone: GroupToneSchema.nullable(),
  picture: PictureSchema.nullable(),
});
export type MentionableGroup = z.infer<typeof MentionableGroupSchema>;

export const MentionablePersonSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  officeName: z.string(),
  portrait: PictureSchema.nullable(),
});
export type MentionablePerson = z.infer<typeof MentionablePersonSchema>;

export const NewsMentionablesSchema = z.object({
  groups: z.array(MentionableGroupSchema),
  persons: z.array(MentionablePersonSchema),
});
export type NewsMentionables = z.infer<typeof NewsMentionablesSchema>;

export const TieableAlbumSchema = z.object({
  albumId: z.number().int(),
  title: z.string(),
  sessionStartYear: z.number().int().nullable(),
  photoCount: z.number().int(),
  cover: PictureSchema.nullable(),
});
export type TieableAlbum = z.infer<typeof TieableAlbumSchema>;

export const NewsTieCandidatesSchema = z.object({
  events: z.array(NewsEventTieSchema),
  albums: z.array(TieableAlbumSchema),
});
export type NewsTieCandidates = z.infer<typeof NewsTieCandidatesSchema>;

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
