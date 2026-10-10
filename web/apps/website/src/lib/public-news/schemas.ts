import { GROUP_TONES } from '@furria/ui/group-tone';
import { z } from 'zod';
import { PictureSchema } from '@/lib/api/picture';
import type { Session } from '@/lib/club';
import { sessionStartingIn } from '@/lib/club';
import { toBerlinWallClock } from '@/lib/date';

export const NEWS_CATEGORIES = ['session', 'achievements', 'club', 'groups'] as const;

export const NewsCategorySchema = z.enum(NEWS_CATEGORIES);

export type NewsCategory = z.infer<typeof NewsCategorySchema>;

export interface NewsSession extends Session {
  number: number | null;
}

const toNewsSession = (startYear: number, number: number | null): NewsSession => ({
  ...sessionStartingIn(startYear),
  number,
});

const WallClockSchema = z.iso.datetime({ offset: true }).transform(toBerlinWallClock);

const NewsPostFieldsSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  teaser: z.string().min(1),
  text: z.string(),
  category: NewsCategorySchema,
  publishedAt: WallClockSchema,
  picture: PictureSchema.nullable(),
});

export type NewsPost = z.infer<typeof NewsPostFieldsSchema>;

export const NewsSectionSchema = z
  .object({
    sessionStartYear: z.number().int(),
    sessionNumber: z.number().int().positive().nullable(),
    posts: z.array(NewsPostFieldsSchema).min(1),
  })
  .transform(({ sessionStartYear, sessionNumber, posts }) => ({
    session: toNewsSession(sessionStartYear, sessionNumber),
    posts,
  }));

export type NewsSection = z.infer<typeof NewsSectionSchema>;

export const NewsResponseSchema = z.object({
  sessions: z.array(NewsSectionSchema),
});

const NewsAuthorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const NewsMentionedGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  tone: z.enum(GROUP_TONES).nullable(),
  picture: PictureSchema.nullable(),
});

export type NewsMentionedGroup = z.infer<typeof NewsMentionedGroupSchema>;

export const NewsMentionedPersonSchema = z.object({
  personId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  officeName: z.string().min(1),
  portrait: PictureSchema.nullable(),
});

export type NewsMentionedPerson = z.infer<typeof NewsMentionedPersonSchema>;

export const NewsEventSchema = z.object({
  eventId: z.number().int().positive(),
  title: z.string().min(1),
  startsAt: WallClockSchema,
  endsAt: WallClockSchema.nullable(),
  venueName: z.string().nullable(),
  isCancelled: z.boolean(),
});

export type NewsEvent = z.infer<typeof NewsEventSchema>;

const NewsAlbumPhotoSchema = PictureSchema.extend({
  mediaItemId: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
}).transform((photo) => ({ ...photo, aspect: photo.width / photo.height }));

export type NewsAlbumPhoto = z.infer<typeof NewsAlbumPhotoSchema>;

export const NewsAlbumSchema = z.object({
  albumId: z.number().int().positive(),
  title: z.string().min(1),
  photoCount: z.number().int().positive(),
  photos: z.array(NewsAlbumPhotoSchema).min(1),
});

export type NewsAlbum = z.infer<typeof NewsAlbumSchema>;

export const NewsArticleSchema = NewsPostFieldsSchema.extend({
  author: NewsAuthorSchema.nullable(),
  pictureCaption: z.string().nullable(),
  mentionedGroups: z.array(NewsMentionedGroupSchema),
  mentionedPersons: z.array(NewsMentionedPersonSchema),
  event: NewsEventSchema.nullable(),
  album: NewsAlbumSchema.nullable(),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;
