import { z } from 'zod';

export const ClubPersonSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  portraitUrl: z.string().nullable(),
  officeName: z.string().nullable(),
});
export type ClubPerson = z.infer<typeof ClubPersonSchema>;

export const ClubSessionSchema = z.object({
  startYear: z.number().int(),
  label: z.string(),
  number: z.number().int().nullable(),
  motto: z.string().nullable(),
  logoSvg: z.string().nullable(),
});
export type ClubSession = z.infer<typeof ClubSessionSchema>;

export const ClubStatsSchema = z.object({
  memberCount: z.number().int(),
  groupCount: z.number().int(),
  joinedThisSessionCount: z.number().int(),
});
export type ClubStats = z.infer<typeof ClubStatsSchema>;

export const ClubAnnouncementSchema = z.object({
  announcementId: z.number().int(),
  title: z.string(),
  body: z.string(),
  publishedAt: z.iso.datetime({ offset: true }),
  validUntil: z.iso.date().nullable(),
  author: ClubPersonSchema,
});
export type ClubAnnouncement = z.infer<typeof ClubAnnouncementSchema>;

export const ClubAnnouncementsSchema = z.object({
  newest: z.array(ClubAnnouncementSchema),
  totalCount: z.number().int(),
});
export type ClubAnnouncements = z.infer<typeof ClubAnnouncementsSchema>;

export const CalendarEntryKindSchema = z.enum([
  'training',
  'rehearsal',
  'performance',
  'meeting',
  'party',
  'other',
]);
export type CalendarEntryKind = z.infer<typeof CalendarEntryKindSchema>;

export const ClubCalendarEntrySchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  kind: CalendarEntryKindSchema,
  venueName: z.string().nullable(),
  isRunning: z.boolean(),
});
export type ClubCalendarEntry = z.infer<typeof ClubCalendarEntrySchema>;

export const ClubBoardSeatSchema = z.object({
  person: ClubPersonSchema,
  officeName: z.string(),
  sortOrder: z.number().int(),
});
export type ClubBoardSeat = z.infer<typeof ClubBoardSeatSchema>;

export const ClubKeyHolderSchema = z.object({
  person: ClubPersonSchema,
  sinceOn: z.iso.date(),
});
export type ClubKeyHolder = z.infer<typeof ClubKeyHolderSchema>;

export const ClubVenueSchema = z.object({
  venueId: z.number().int(),
  name: z.string(),
  sortOrder: z.number().int(),
  holders: z.array(ClubKeyHolderSchema),
});
export type ClubVenue = z.infer<typeof ClubVenueSchema>;

export const ClubHubSchema = z.object({
  session: ClubSessionSchema,
  stats: ClubStatsSchema,
  announcements: ClubAnnouncementsSchema,
  calendar: z.array(ClubCalendarEntrySchema),
  board: z.array(ClubBoardSeatSchema),
  venues: z.array(ClubVenueSchema),
});
export type ClubHub = z.infer<typeof ClubHubSchema>;
