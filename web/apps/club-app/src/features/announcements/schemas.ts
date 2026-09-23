import { z } from 'zod';

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 120;
export const ANNOUNCEMENT_BODY_MAX_LENGTH = 4_000;

const TITLE_REQUIRED_MESSAGE = 'Gib dem Aushang eine Überschrift.';
const TITLE_TOO_LONG_MESSAGE = 'Die Überschrift darf höchstens 120 Zeichen haben.';
const BODY_REQUIRED_MESSAGE = 'Der Text fehlt.';
const BODY_TOO_LONG_MESSAGE = 'Der Text darf höchstens 4000 Zeichen haben.';

export const AnnouncementAuthorSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  portraitUrl: z.string().nullable(),
  officeName: z.string().nullable(),
});
export type AnnouncementAuthor = z.infer<typeof AnnouncementAuthorSchema>;

export const AnnouncementSchema = z.object({
  announcementId: z.number().int(),
  title: z.string(),
  body: z.string(),
  publishedAt: z.iso.datetime({ offset: true }),
  validUntil: z.iso.date().nullable(),
  author: AnnouncementAuthorSchema,
  viewerMayEdit: z.boolean(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

export const AnnouncementsResponseSchema = z.object({
  announcements: z.array(AnnouncementSchema),
});
export type AnnouncementsResponse = z.infer<typeof AnnouncementsResponseSchema>;

export const CreatedAnnouncementSchema = z.object({ announcementId: z.number().int() });
export type CreatedAnnouncement = z.infer<typeof CreatedAnnouncementSchema>;

export const AnnouncementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, TITLE_REQUIRED_MESSAGE)
    .max(ANNOUNCEMENT_TITLE_MAX_LENGTH, TITLE_TOO_LONG_MESSAGE),
  body: z
    .string()
    .trim()
    .min(1, BODY_REQUIRED_MESSAGE)
    .max(ANNOUNCEMENT_BODY_MAX_LENGTH, BODY_TOO_LONG_MESSAGE),
  validUntil: z.iso.date().nullable(),
});
export type AnnouncementForm = z.infer<typeof AnnouncementFormSchema>;

export const EMPTY_ANNOUNCEMENT_FORM: AnnouncementForm = { title: '', body: '', validUntil: null };

export const toAnnouncementFormValues = (announcement: Announcement | null): AnnouncementForm =>
  announcement === null
    ? EMPTY_ANNOUNCEMENT_FORM
    : {
        title: announcement.title,
        body: announcement.body,
        validUntil: announcement.validUntil,
      };
