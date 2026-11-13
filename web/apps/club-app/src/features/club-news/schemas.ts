import { z } from 'zod';
import { MentionedGroupSchema, MentionedPersonSchema } from '@/features/rich-text/schemas';
import { PictureSchema } from '@/lib/api/schemas';

const InstantSchema = z.iso.datetime({ offset: true });

const ReadNewsCategorySchema = z.enum(['session', 'achievements', 'club', 'groups']);

const ReadNewsPostSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  teaser: z.string().min(1),
  text: z.string(),
  category: ReadNewsCategorySchema,
  publishedAt: InstantSchema,
  picture: PictureSchema.nullable(),
});
export type ReadNewsPost = z.infer<typeof ReadNewsPostSchema>;

const ReadNewsSessionSchema = z.object({
  sessionStartYear: z.number().int(),
  sessionNumber: z.number().int().positive().nullable(),
  posts: z.array(ReadNewsPostSchema),
});
export type ReadNewsSession = z.infer<typeof ReadNewsSessionSchema>;

export const ReadNewsSchema = z.object({ sessions: z.array(ReadNewsSessionSchema) });
export type ReadNews = z.infer<typeof ReadNewsSchema>;

const ReadNewsEventSchema = z.object({
  eventId: z.number().int().positive(),
  title: z.string().min(1),
  startsAt: InstantSchema,
  endsAt: InstantSchema.nullable(),
  venueName: z.string().nullable(),
  isCancelled: z.boolean(),
  picture: PictureSchema.nullable(),
});
export type ReadNewsEvent = z.infer<typeof ReadNewsEventSchema>;

const ReadNewsAlbumPhotoSchema = PictureSchema.extend({
  mediaItemId: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const ReadNewsAlbumSchema = z.object({
  albumId: z.number().int().positive(),
  title: z.string().min(1),
  photoCount: z.number().int().positive(),
  photos: z.array(ReadNewsAlbumPhotoSchema).min(1),
});
export type ReadNewsAlbum = z.infer<typeof ReadNewsAlbumSchema>;

export const ReadNewsArticleSchema = ReadNewsPostSchema.extend({
  author: z.object({ firstName: z.string().min(1), lastName: z.string().min(1) }).nullable(),
  pictureCaption: z.string().nullable(),
  mentionedGroups: z.array(MentionedGroupSchema),
  mentionedPersons: z.array(MentionedPersonSchema),
  event: ReadNewsEventSchema.nullable(),
  album: ReadNewsAlbumSchema.nullable(),
});
export type ReadNewsArticle = z.infer<typeof ReadNewsArticleSchema>;
