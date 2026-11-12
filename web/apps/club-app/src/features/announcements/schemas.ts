import { z } from 'zod';
import { AttendanceAnswerSchema } from '@/features/attendance/schemas';
import type { CalendarDeadlineIssueCode } from '@/features/calendar/calendar-deadlines';
import type { CalendarPollIssueCode } from '@/features/calendar/calendar-polls';
import {
  POLL_OPTION_LABEL_MAX_LENGTH,
  POLL_QUESTION_MAX_LENGTH,
} from '@/features/calendar/calendar-polls';
import type { CalendarSignUpListIssueCode } from '@/features/calendar/calendar-sign-up-lists';
import {
  SIGN_UP_LIST_HINT_MAX_LENGTH,
  SIGN_UP_LIST_TITLE_MAX_LENGTH,
} from '@/features/calendar/calendar-sign-up-lists';
import {
  CalendarAttendanceAnswerSchema,
  CalendarAttendancePersonSchema,
  CalendarPollFormSchema,
  CalendarPollSchema,
  CalendarReminderSchema,
  CalendarSignUpListFormSchema,
  CalendarSignUpListSchema,
} from '@/features/calendar/schemas';
import { MentionTargetsSchema } from '@/features/rich-text/schemas';
import { PictureSchema } from '@/lib/api/schemas';
import type { AnnouncementAddOnIssue } from './announcement-add-on-issues';
import { toAnnouncementAddOnIssues } from './announcement-add-on-issues';

export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 120;
export const ANNOUNCEMENT_BODY_MAX_LENGTH = 4_000;

const TITLE_REQUIRED_MESSAGE = 'Gib dem Aushang eine Überschrift.';
const TITLE_TOO_LONG_MESSAGE = 'Die Überschrift darf höchstens 120 Zeichen haben.';
const BODY_REQUIRED_MESSAGE = 'Der Text fehlt.';
const BODY_TOO_LONG_MESSAGE = 'Der Text darf höchstens 4000 Zeichen haben.';

const DEADLINE_TIME_MISSING_MESSAGE = 'Wähle eine Uhrzeit.';

const ATTENDANCE_ISSUE_MESSAGES: Record<CalendarDeadlineIssueCode, string> = {
  deadlineTimeMissing: DEADLINE_TIME_MISSING_MESSAGE,
  deadlineAfterStart: 'Antworten bis darf nicht nach Gültig bis liegen.',
};

const POLL_ISSUE_MESSAGES: Record<CalendarPollIssueCode, string> = {
  questionMissing: 'Die Umfrage braucht eine Frage.',
  questionTooLong: `Höchstens ${POLL_QUESTION_MAX_LENGTH} Zeichen.`,
  optionMissing: 'Die Antwort braucht einen Text.',
  optionTooLong: `Höchstens ${POLL_OPTION_LABEL_MAX_LENGTH} Zeichen.`,
  optionRepeated: 'Diese Antwort gibt es schon.',
  deadlineTimeMissing: DEADLINE_TIME_MISSING_MESSAGE,
  deadlineAfterStart: 'Abstimmen bis darf nicht nach Gültig bis liegen.',
};

const SIGN_UP_LIST_ISSUE_MESSAGES: Record<CalendarSignUpListIssueCode, string> = {
  titleMissing: 'Die Liste braucht einen Titel.',
  titleTooLong: `Höchstens ${SIGN_UP_LIST_TITLE_MAX_LENGTH} Zeichen.`,
  hintTooLong: `Höchstens ${SIGN_UP_LIST_HINT_MAX_LENGTH} Zeichen.`,
  deadlineTimeMissing: DEADLINE_TIME_MISSING_MESSAGE,
  deadlineAfterStart: 'Eintragen bis darf nicht nach Gültig bis liegen.',
};

const toAddOnIssueMessage = (issue: AnnouncementAddOnIssue): string => {
  switch (issue.addOn) {
    case 'attendance':
      return ATTENDANCE_ISSUE_MESSAGES[issue.code];
    case 'poll':
      return POLL_ISSUE_MESSAGES[issue.code];
    case 'signUpList':
      return SIGN_UP_LIST_ISSUE_MESSAGES[issue.code];
  }
};

export const AnnouncementAuthorSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  portrait: PictureSchema.nullable(),
  officeName: z.string().nullable(),
});
export type AnnouncementAuthor = z.infer<typeof AnnouncementAuthorSchema>;

export const AnnouncementAddOnKindSchema = z.enum(['attendance', 'poll', 'signUpList']);
export type AnnouncementAddOnKind = z.infer<typeof AnnouncementAddOnKindSchema>;

export const AnnouncementAttendanceSchema = z.object({
  answersUntil: z.iso.datetime({ offset: true }).nullable(),
  closedAt: z.iso.datetime({ offset: true }).nullable(),
  closedByFirstName: z.string().nullable(),
  closedByLastName: z.string().nullable(),
  isClosed: z.boolean(),
  yes: z.number().int(),
  maybe: z.number().int(),
  no: z.number().int(),
  concernedCount: z.number().int(),
  answers: z.array(CalendarAttendanceAnswerSchema),
  notAnswered: z.array(CalendarAttendancePersonSchema).nullable(),
  reminder: CalendarReminderSchema.nullable(),
});
export type AnnouncementAttendance = z.infer<typeof AnnouncementAttendanceSchema>;

export const AnnouncementAddOnSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('attendance'), attendance: AnnouncementAttendanceSchema }),
  z.object({ kind: z.literal('poll'), poll: CalendarPollSchema }),
  z.object({ kind: z.literal('signUpList'), signUpList: CalendarSignUpListSchema }),
]);
export type AnnouncementAddOn = z.infer<typeof AnnouncementAddOnSchema>;

export const AnnouncementSchema = z.object({
  announcementId: z.number().int(),
  title: z.string(),
  body: z.string(),
  mentions: MentionTargetsSchema,
  publishedAt: z.iso.datetime({ offset: true }),
  validUntil: z.iso.date().nullable(),
  author: AnnouncementAuthorSchema.nullable(),
  viewerMayEdit: z.boolean(),
  addOns: z.array(AnnouncementAddOnSchema),
  answerCount: z.number().int(),
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  viewerMayAnswer: z.boolean(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

export const AnnouncementsResponseSchema = z.object({
  announcements: z.array(AnnouncementSchema),
});
export type AnnouncementsResponse = z.infer<typeof AnnouncementsResponseSchema>;

export const AnnouncementMentionablesSchema = z.object({ mentionables: MentionTargetsSchema });
export type AnnouncementMentionables = z.infer<typeof AnnouncementMentionablesSchema>;

export const CreatedAnnouncementSchema = z.object({ announcementId: z.number().int() });
export type CreatedAnnouncement = z.infer<typeof CreatedAnnouncementSchema>;

export const AnnouncementAttendanceFormSchema = z.object({
  answersUntilDay: z.string(),
  answersUntilTime: z.string(),
  heldAnswersUntil: z.string().nullable(),
});
export type AnnouncementAttendanceForm = z.infer<typeof AnnouncementAttendanceFormSchema>;

export const AnnouncementAddOnCardFormSchema = z.discriminatedUnion('kind', [
  z.object({
    key: z.string(),
    kind: z.literal('attendance'),
    attendance: AnnouncementAttendanceFormSchema,
  }),
  z.object({ key: z.string(), kind: z.literal('poll'), poll: CalendarPollFormSchema }),
  z.object({
    key: z.string(),
    kind: z.literal('signUpList'),
    signUpList: CalendarSignUpListFormSchema,
  }),
]);
export type AnnouncementAddOnCardForm = z.infer<typeof AnnouncementAddOnCardFormSchema>;

export const AnnouncementFormSchema = z
  .object({
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
    addOns: z.array(AnnouncementAddOnCardFormSchema),
  })
  .superRefine((form, ctx) => {
    for (const issue of toAnnouncementAddOnIssues(form.addOns, form.validUntil)) {
      ctx.addIssue({ code: 'custom', message: toAddOnIssueMessage(issue), path: issue.path });
    }
  });
export type AnnouncementForm = z.infer<typeof AnnouncementFormSchema>;
