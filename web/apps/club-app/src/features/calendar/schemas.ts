import { z } from 'zod';
import { AttendanceAnswerSchema } from '@/features/attendance/schemas';
import { CalendarEntryKindSchema } from '@/features/club/schemas';
import { AppSearchSchema } from '@/features/session/schemas';
import { ClockTimeSchema, PictureSchema } from '@/lib/api/schemas';
import { EVENT_SALES_STATUS_KEYS } from '@/lib/event-copy';
import { GroupToneSchema } from '@/lib/group-tone';
import type { CalendarDayScheduleIssueCode } from './calendar-day-schedules';
import {
  DAY_SCHEDULE_STEP_TEXT_MAX_LENGTH,
  DAY_SCHEDULE_TITLE_MAX_LENGTH,
  toDayScheduleIssues,
} from './calendar-day-schedules';
import type { CalendarPollIssueCode } from './calendar-polls';
import {
  POLL_OPTION_LABEL_MAX_LENGTH,
  POLL_QUESTION_MAX_LENGTH,
  toPollIssues,
} from './calendar-polls';
import type { CalendarSignUpListIssueCode } from './calendar-sign-up-lists';
import {
  SIGN_UP_LIST_HINT_MAX_LENGTH,
  SIGN_UP_LIST_TITLE_MAX_LENGTH,
  toSignUpListIssues,
} from './calendar-sign-up-lists';

export const CalendarSearchSchema = AppSearchSchema.extend({
  day: z.iso.date().optional().catch(undefined),
  entry: z.number().int().positive().optional().catch(undefined),
});
export type CalendarSearch = z.infer<typeof CalendarSearchSchema>;

const CLOCK_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const CalendarEntryDraftSearchSchema = CalendarSearchSchema.extend({
  group: z.number().int().positive().optional().catch(undefined),
  kind: CalendarEntryKindSchema.optional().catch(undefined),
  start: z.string().regex(CLOCK_PATTERN).optional().catch(undefined),
  end: z.string().regex(CLOCK_PATTERN).optional().catch(undefined),
  venue: z.number().int().positive().optional().catch(undefined),
  back: z.literal('group').optional().catch(undefined),
});
export type CalendarEntryDraftSearch = z.infer<typeof CalendarEntryDraftSearchSchema>;

export const CalendarEntryAudienceSchema = z.enum(['club', 'groups', 'people']);
export type CalendarEntryAudience = z.infer<typeof CalendarEntryAudienceSchema>;

export const AudienceGroupSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type AudienceGroup = z.infer<typeof AudienceGroupSchema>;

export const AudiencePersonSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});
export type AudiencePerson = z.infer<typeof AudiencePersonSchema>;

export const CalendarAddOnKindSchema = z.enum([
  'attendance',
  'participatingGroups',
  'poll',
  'signUpList',
  'daySchedule',
]);
export type CalendarAddOnKind = z.infer<typeof CalendarAddOnKindSchema>;

export const CalendarPollOptionSchema = z.object({
  optionId: z.number().int(),
  label: z.string(),
  voteCount: z.number().int(),
  viewerChose: z.boolean(),
  voters: z.array(AudiencePersonSchema),
});
export type CalendarPollOption = z.infer<typeof CalendarPollOptionSchema>;

export const CalendarAttendancePersonSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});
export type CalendarAttendancePerson = z.infer<typeof CalendarAttendancePersonSchema>;

export const CalendarPollSchema = z.object({
  pollId: z.number().int(),
  question: z.string(),
  allowsMultipleChoices: z.boolean(),
  isAnonymous: z.boolean(),
  votesUntil: z.iso.datetime({ offset: true }).nullable(),
  closedAt: z.iso.datetime({ offset: true }).nullable(),
  isClosed: z.boolean(),
  voterCount: z.number().int(),
  concernedCount: z.number().int().nullable(),
  notAnswered: z.array(CalendarAttendancePersonSchema).nullable(),
  options: z.array(CalendarPollOptionSchema),
});
export type CalendarPoll = z.infer<typeof CalendarPollSchema>;

export const CalendarSignUpLineSchema = z.object({
  lineId: z.number().int(),
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  text: z.string().nullable(),
  byViewer: z.boolean(),
});
export type CalendarSignUpLine = z.infer<typeof CalendarSignUpLineSchema>;

export const CalendarSignUpListSchema = z.object({
  signUpListId: z.number().int(),
  title: z.string(),
  hint: z.string().nullable(),
  signUpUntil: z.iso.datetime({ offset: true }).nullable(),
  closedAt: z.iso.datetime({ offset: true }).nullable(),
  isClosed: z.boolean(),
  lines: z.array(CalendarSignUpLineSchema),
  concernedCount: z.number().int().nullable(),
  notAnswered: z.array(CalendarAttendancePersonSchema).nullable(),
});
export type CalendarSignUpList = z.infer<typeof CalendarSignUpListSchema>;

export const CalendarDayScheduleStepSchema = z.object({
  stepId: z.number().int(),
  day: z.number().int(),
  time: ClockTimeSchema,
  text: z.string(),
});
export type CalendarDayScheduleStep = z.infer<typeof CalendarDayScheduleStepSchema>;

export const CalendarDayScheduleSchema = z.object({
  dayScheduleId: z.number().int(),
  title: z.string().nullable(),
  steps: z.array(CalendarDayScheduleStepSchema),
});
export type CalendarDaySchedule = z.infer<typeof CalendarDayScheduleSchema>;

export const CalendarEntryAddOnSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('attendance') }),
  z.object({ kind: z.literal('participatingGroups') }),
  z.object({ kind: z.literal('poll'), poll: CalendarPollSchema }),
  z.object({ kind: z.literal('signUpList'), signUpList: CalendarSignUpListSchema }),
  z.object({ kind: z.literal('daySchedule'), daySchedule: CalendarDayScheduleSchema }),
]);
export type CalendarEntryAddOn = z.infer<typeof CalendarEntryAddOnSchema>;

export const ParticipatingGroupSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type ParticipatingGroup = z.infer<typeof ParticipatingGroupSchema>;

export const CalendarEventFactsSchema = z.object({
  doorsOpenAt: ClockTimeSchema.nullable(),
  teaser: z.string(),
  ageHint: z.string().nullable(),
  priceCents: z.number().int().nullable(),
  presaleStartsAt: z.iso.datetime({ offset: true }).nullable(),
  status: z.enum(EVENT_SALES_STATUS_KEYS),
  picture: PictureSchema.nullable(),
});
export type CalendarEventFacts = z.infer<typeof CalendarEventFactsSchema>;

export const CalendarAttendanceAnswerSchema = CalendarAttendancePersonSchema.extend({
  answer: AttendanceAnswerSchema,
  recordedByFirstName: z.string().nullable(),
  recordedByLastName: z.string().nullable(),
  answeredAt: z.iso.datetime({ offset: true }),
});
export type CalendarAttendanceAnswer = z.infer<typeof CalendarAttendanceAnswerSchema>;

export const CalendarAttendanceSchema = z.object({
  isClosed: z.boolean(),
  yes: z.number().int(),
  maybe: z.number().int(),
  no: z.number().int(),
  answers: z.array(CalendarAttendanceAnswerSchema).nullable(),
  notAnswered: z.array(CalendarAttendancePersonSchema).nullable(),
});
export type CalendarAttendance = z.infer<typeof CalendarAttendanceSchema>;

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
  audience: CalendarEntryAudienceSchema,
  audienceGroups: z.array(AudienceGroupSchema),
  audiencePeople: z.array(AudiencePersonSchema),
  asksForResponse: z.boolean(),
  addOns: z.array(CalendarEntryAddOnSchema),
  attendance: CalendarAttendanceSchema.nullable(),
  description: z.string().nullable(),
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  mayAnswer: z.boolean(),
  isRunning: z.boolean(),
  event: CalendarEventFactsSchema.nullable(),
});
export type CalendarEntry = z.infer<typeof CalendarEntrySchema>;

export const UsualTrainingSchema = z.object({
  usualTrainingTimeId: z.number().int(),
  groupId: z.number().int(),
  groupName: z.string(),
  groupTone: GroupToneSchema.nullable(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
});
export type UsualTraining = z.infer<typeof UsualTrainingSchema>;

export const CalendarResponseSchema = z.object({
  entries: z.array(CalendarEntrySchema),
  usualTrainings: z.array(UsualTrainingSchema),
});
export type CalendarResponse = z.infer<typeof CalendarResponseSchema>;

export const CalendarEntryResponseSchema = z.object({ entry: CalendarEntrySchema });
export type CalendarEntryResponse = z.infer<typeof CalendarEntryResponseSchema>;

export const RunningVenueSchema = z.object({
  venueId: z.number().int(),
  name: z.string(),
});
export type RunningVenue = z.infer<typeof RunningVenueSchema>;

export const RunningVenuesResponseSchema = z.object({ venues: z.array(RunningVenueSchema) });
export type RunningVenuesResponse = z.infer<typeof RunningVenuesResponseSchema>;

export const ChoosablePersonSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  groupIds: z.array(z.number().int()),
});
export type ChoosablePerson = z.infer<typeof ChoosablePersonSchema>;

export const ChoosablePeopleResponseSchema = z.object({ people: z.array(ChoosablePersonSchema) });
export type ChoosablePeopleResponse = z.infer<typeof ChoosablePeopleResponseSchema>;

export const CALENDAR_TITLE_MAX_LENGTH = 120;
export const CALENDAR_DESCRIPTION_MAX_LENGTH = 2000;

const END_BEFORE_START_MESSAGE = 'Das Ende muss nach dem Beginn liegen.';
const OWNER_CANNOT_PARTICIPATE_MESSAGE = 'Der Eigentümer ist automatisch beteiligt.';
const NO_PARTICIPATING_GROUP_MESSAGE = 'Wähle mindestens eine mitwirkende Gruppe.';
const NO_AUDIENCE_GROUP_MESSAGE = 'Wähle mindestens eine Gruppe.';
const NO_AUDIENCE_PERSON_MESSAGE = 'Wähle mindestens eine Person.';
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

export const CalendarPollOptionFormSchema = z.object({
  key: z.string(),
  optionId: z.number().int().nullable(),
  label: z.string(),
});
export type CalendarPollOptionForm = z.infer<typeof CalendarPollOptionFormSchema>;

export const CalendarPollFormSchema = z.object({
  pollId: z.number().int().nullable(),
  question: z.string(),
  allowsMultipleChoices: z.boolean(),
  isAnonymous: z.boolean(),
  votesUntilDay: z.string(),
  votesUntilTime: z.string(),
  heldVotesUntil: z.string().nullable(),
  options: z.array(CalendarPollOptionFormSchema),
});
export type CalendarPollForm = z.infer<typeof CalendarPollFormSchema>;

export const CalendarSignUpListFormSchema = z.object({
  signUpListId: z.number().int().nullable(),
  title: z.string(),
  hint: z.string(),
  signUpUntilDay: z.string(),
  signUpUntilTime: z.string(),
  heldSignUpUntil: z.string().nullable(),
});
export type CalendarSignUpListForm = z.infer<typeof CalendarSignUpListFormSchema>;

export const CalendarDayScheduleStepFormSchema = z.object({
  key: z.string(),
  stepId: z.number().int().nullable(),
  day: z.number().int(),
  time: z.string(),
  text: z.string(),
});
export type CalendarDayScheduleStepForm = z.infer<typeof CalendarDayScheduleStepFormSchema>;

export const CalendarDayScheduleFormSchema = z.object({
  dayScheduleId: z.number().int().nullable(),
  title: z.string(),
  steps: z.array(CalendarDayScheduleStepFormSchema),
});
export type CalendarDayScheduleForm = z.infer<typeof CalendarDayScheduleFormSchema>;

export const CalendarAddOnCardFormSchema = z.discriminatedUnion('kind', [
  z.object({ key: z.string(), kind: z.literal('attendance') }),
  z.object({ key: z.string(), kind: z.literal('participatingGroups') }),
  z.object({ key: z.string(), kind: z.literal('poll'), poll: CalendarPollFormSchema }),
  z.object({
    key: z.string(),
    kind: z.literal('signUpList'),
    signUpList: CalendarSignUpListFormSchema,
  }),
  z.object({
    key: z.string(),
    kind: z.literal('daySchedule'),
    daySchedule: CalendarDayScheduleFormSchema,
  }),
]);
export type CalendarAddOnCardForm = z.infer<typeof CalendarAddOnCardFormSchema>;

const POLL_ISSUE_MESSAGES: Record<CalendarPollIssueCode, string> = {
  questionMissing: 'Die Umfrage braucht eine Frage.',
  questionTooLong: `Höchstens ${POLL_QUESTION_MAX_LENGTH} Zeichen.`,
  optionMissing: 'Die Antwort braucht einen Text.',
  optionTooLong: `Höchstens ${POLL_OPTION_LABEL_MAX_LENGTH} Zeichen.`,
  optionRepeated: 'Diese Antwort gibt es schon.',
  deadlineTimeMissing: 'Wähle eine Uhrzeit.',
  deadlineAfterStart: 'Abstimmen bis darf nicht nach dem Beginn liegen.',
};

const SIGN_UP_LIST_ISSUE_MESSAGES: Record<CalendarSignUpListIssueCode, string> = {
  titleMissing: 'Die Liste braucht einen Titel.',
  titleTooLong: `Höchstens ${SIGN_UP_LIST_TITLE_MAX_LENGTH} Zeichen.`,
  hintTooLong: `Höchstens ${SIGN_UP_LIST_HINT_MAX_LENGTH} Zeichen.`,
  deadlineTimeMissing: 'Wähle eine Uhrzeit.',
  deadlineAfterStart: 'Eintragen bis darf nicht nach dem Beginn liegen.',
};

const DAY_SCHEDULE_ISSUE_MESSAGES: Record<CalendarDayScheduleIssueCode, string> = {
  titleTooLong: `Höchstens ${DAY_SCHEDULE_TITLE_MAX_LENGTH} Zeichen.`,
  stepsMissing: 'Der Tagesablauf braucht mindestens einen Schritt.',
  stepTimeMissing: 'Wähle eine Uhrzeit.',
  stepTextMissing: 'Der Schritt braucht einen Text.',
  stepTextTooLong: `Höchstens ${DAY_SCHEDULE_STEP_TEXT_MAX_LENGTH} Zeichen.`,
  stepDayOutside: 'Dieser Tag liegt nicht mehr im Termin.',
};

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
    audience: CalendarEntryAudienceSchema,
    audienceGroupIds: z.array(z.string()),
    audiencePersonIds: z.array(z.string()),
    startDay: z.string().min(1, 'Der Eintrag braucht einen Tag.'),
    startTime: z.string().min(1, 'Der Eintrag braucht eine Uhrzeit.'),
    endDay: z.string(),
    endTime: z.string(),
    addOns: z.array(CalendarAddOnCardFormSchema),
    participatingGroupIds: z.array(z.string()),
  })
  .superRefine((form, ctx) => {
    const hasParticipatingGroups = form.addOns.some((card) => card.kind === 'participatingGroups');

    const start = { day: form.startDay, time: form.startTime };

    for (const issue of toPollIssues(form.addOns, start)) {
      ctx.addIssue({ code: 'custom', message: POLL_ISSUE_MESSAGES[issue.code], path: issue.path });
    }
    for (const issue of toSignUpListIssues(form.addOns, start)) {
      ctx.addIssue({
        code: 'custom',
        message: SIGN_UP_LIST_ISSUE_MESSAGES[issue.code],
        path: issue.path,
      });
    }

    for (const issue of toDayScheduleIssues(form.addOns, form)) {
      ctx.addIssue({
        code: 'custom',
        message: DAY_SCHEDULE_ISSUE_MESSAGES[issue.code],
        path: issue.path,
      });
    }

    if (hasParticipatingGroups && form.participatingGroupIds.includes(form.ownerId)) {
      ctx.addIssue({
        code: 'custom',
        message: OWNER_CANNOT_PARTICIPATE_MESSAGE,
        path: ['participatingGroupIds'],
      });
    }
    if (hasParticipatingGroups && form.participatingGroupIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: NO_PARTICIPATING_GROUP_MESSAGE,
        path: ['participatingGroupIds'],
      });
    }
    if (form.audience === 'groups' && form.audienceGroupIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: NO_AUDIENCE_GROUP_MESSAGE,
        path: ['audienceGroupIds'],
      });
    }
    if (form.audience === 'people' && form.audiencePersonIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: NO_AUDIENCE_PERSON_MESSAGE,
        path: ['audiencePersonIds'],
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
