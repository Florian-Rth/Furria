import { z } from 'zod';
import { PictureSchema } from '@/lib/api/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

export const MentionedGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  tone: GroupToneSchema.nullable(),
  picture: PictureSchema.nullable(),
});
export type MentionedGroup = z.infer<typeof MentionedGroupSchema>;

export const MentionedPersonSchema = z.object({
  personId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  officeName: z.string().min(1).nullable(),
  portrait: PictureSchema.nullable(),
});
export type MentionedPerson = z.infer<typeof MentionedPersonSchema>;

const InstantSchema = z.iso.datetime({ offset: true });

export const MentionedCalendarEntrySchema = z.object({
  calendarEntryId: z.number().int().positive(),
  title: z.string().min(1),
  startsAt: InstantSchema,
  endsAt: InstantSchema.nullable(),
});
export type MentionedCalendarEntry = z.infer<typeof MentionedCalendarEntrySchema>;

export const MentionedEventSchema = z.object({
  eventId: z.number().int().positive(),
  title: z.string().min(1),
  startsAt: InstantSchema,
  isCancelled: z.boolean(),
});
export type MentionedEvent = z.infer<typeof MentionedEventSchema>;

export const MentionedNewsPostSchema = z.object({
  newsPostId: z.number().int().positive(),
  slug: z.string().min(1),
  title: z.string().min(1),
  publishedAt: InstantSchema,
});
export type MentionedNewsPost = z.infer<typeof MentionedNewsPostSchema>;

export const MentionedAlbumSchema = z.object({
  albumId: z.number().int().positive(),
  title: z.string().min(1),
});
export type MentionedAlbum = z.infer<typeof MentionedAlbumSchema>;

export const MentionTargetsSchema = z.object({
  persons: z.array(MentionedPersonSchema),
  groups: z.array(MentionedGroupSchema),
  calendarEntries: z.array(MentionedCalendarEntrySchema),
  events: z.array(MentionedEventSchema),
  newsPosts: z.array(MentionedNewsPostSchema),
  albums: z.array(MentionedAlbumSchema),
});
export type MentionTargets = z.infer<typeof MentionTargetsSchema>;
