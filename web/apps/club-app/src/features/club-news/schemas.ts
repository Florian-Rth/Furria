import { z } from 'zod';
import { PictureSchema } from '@/lib/api/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

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

const ReadNewsGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  tone: GroupToneSchema.nullable(),
  picture: PictureSchema.nullable(),
});
export type ReadNewsGroup = z.infer<typeof ReadNewsGroupSchema>;

const ReadNewsPersonSchema = z.object({
  personId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  officeName: z.string().min(1),
  portrait: PictureSchema.nullable(),
});
export type ReadNewsPerson = z.infer<typeof ReadNewsPersonSchema>;

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
  mentionedGroups: z.array(ReadNewsGroupSchema),
  mentionedPersons: z.array(ReadNewsPersonSchema),
  event: ReadNewsEventSchema.nullable(),
  album: ReadNewsAlbumSchema.nullable(),
});
export type ReadNewsArticle = z.infer<typeof ReadNewsArticleSchema>;
