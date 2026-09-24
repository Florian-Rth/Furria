import { z } from 'zod';
import { CalendarEntryKindSchema } from '@/features/club';
import { AppSearchSchema } from '@/features/session';
import { GroupToneSchema } from '@/lib/group-tone';

export const CalendarBoardSearchSchema = AppSearchSchema.extend({
  scope: z.string().optional().catch(undefined),
  view: z.enum(['list', 'month']).optional().catch(undefined),
  month: z.string().optional().catch(undefined),
  day: z.string().optional().catch(undefined),
});
export type CalendarBoardSearch = z.infer<typeof CalendarBoardSearchSchema>;

export const CalendarEntryVisibilitySchema = z.enum(['group', 'club', 'public']);
export type CalendarEntryVisibility = z.infer<typeof CalendarEntryVisibilitySchema>;

export const AttendanceAnswerSchema = z.enum(['yes', 'no', 'maybe']);
export type AttendanceAnswer = z.infer<typeof AttendanceAnswerSchema>;

export const ParticipatingGroupSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type ParticipatingGroup = z.infer<typeof ParticipatingGroupSchema>;

export const CalendarEntrySchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  kind: CalendarEntryKindSchema,
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
  ownerGroupId: z.number().int().nullable(),
  ownerGroupName: z.string().nullable(),
  ownerGroupTone: GroupToneSchema.nullable(),
  participatingGroups: z.array(ParticipatingGroupSchema),
  visibility: CalendarEntryVisibilitySchema,
  asksForResponse: z.boolean(),
  description: z.string().nullable(),
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  isRunning: z.boolean(),
});
export type CalendarEntry = z.infer<typeof CalendarEntrySchema>;

export const CalendarResponseSchema = z.object({ entries: z.array(CalendarEntrySchema) });
export type CalendarResponse = z.infer<typeof CalendarResponseSchema>;

export const RunningVenueSchema = z.object({
  venueId: z.number().int(),
  name: z.string(),
});
export type RunningVenue = z.infer<typeof RunningVenueSchema>;

export const RunningVenuesResponseSchema = z.object({ venues: z.array(RunningVenueSchema) });
export type RunningVenuesResponse = z.infer<typeof RunningVenuesResponseSchema>;

export const CALENDAR_TITLE_MAX_LENGTH = 120;
export const CALENDAR_DESCRIPTION_MAX_LENGTH = 2000;

const END_BEFORE_START_MESSAGE = 'Das Ende muss nach dem Beginn liegen.';
const OWNER_CANNOT_PARTICIPATE_MESSAGE = 'Der Eigentümer ist automatisch beteiligt.';
const NO_END_DAY = '';

export const CalendarCollisionSchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
});
export type CalendarCollision = z.infer<typeof CalendarCollisionSchema>;

export const WrittenCalendarEntrySchema = z.object({
  calendarEntryId: z.number().int(),
  venueCollisions: z.array(CalendarCollisionSchema),
});
export type WrittenCalendarEntry = z.infer<typeof WrittenCalendarEntrySchema>;

export const CalendarEntryFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Der Eintrag braucht einen Titel.')
      .max(CALENDAR_TITLE_MAX_LENGTH, `Höchstens ${CALENDAR_TITLE_MAX_LENGTH} Zeichen.`),
    description: z
      .string()
      .max(
        CALENDAR_DESCRIPTION_MAX_LENGTH,
        `Höchstens ${CALENDAR_DESCRIPTION_MAX_LENGTH} Zeichen.`,
      ),
    ownerId: z.string(),
    venueId: z.string(),
    kind: CalendarEntryKindSchema,
    visibility: CalendarEntryVisibilitySchema,
    startDay: z.string().min(1, 'Der Eintrag braucht einen Tag.'),
    startTime: z.string().min(1, 'Der Eintrag braucht eine Uhrzeit.'),
    endDay: z.string(),
    endTime: z.string(),
    asksForResponse: z.boolean(),
    participatingGroupIds: z.array(z.string()),
  })
  .superRefine((form, ctx) => {
    if (form.participatingGroupIds.includes(form.ownerId)) {
      ctx.addIssue({
        code: 'custom',
        message: OWNER_CANNOT_PARTICIPATE_MESSAGE,
        path: ['participatingGroupIds'],
      });
    }
    if (form.endDay === NO_END_DAY) {
      return;
    }
    if (`${form.endDay}T${form.endTime}` >= `${form.startDay}T${form.startTime}`) {
      return;
    }

    ctx.addIssue({ code: 'custom', message: END_BEFORE_START_MESSAGE, path: ['endTime'] });
  });
export type CalendarEntryForm = z.infer<typeof CalendarEntryFormSchema>;
