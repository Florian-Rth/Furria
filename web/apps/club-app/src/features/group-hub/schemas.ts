import { z } from 'zod';
import { AttendanceAnswerSchema } from '@/features/attendance/schemas';
import { GroupDetailAdminSchema, GroupDetailMemberSchema } from '@/features/group-detail/schemas';
import { AppSearchSchema } from '@/features/session/schemas';
import { PersonRefSchema, PictureEditingSchema, PictureSchema } from '@/lib/api/schemas';
import { CALENDAR_KIND_KEYS } from '@/lib/calendar-copy';
import { ClubIconSchema } from '@/lib/club-icon';
import { GroupToneSchema } from '@/lib/group-tone';
import { requiredDay, requiredPerson } from '@/lib/required-fields';

export const GroupEntryPrefillSearchSchema = AppSearchSchema.extend({
  person: z.string().optional().catch(undefined),
});
export type GroupEntryPrefillSearch = z.infer<typeof GroupEntryPrefillSearchSchema>;

export const WEEKDAY_VALUES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const WeekdaySchema = z.enum(WEEKDAY_VALUES);
export type Weekday = z.infer<typeof WeekdaySchema>;

export const MyGroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  isMember: z.boolean(),
  isAdmin: z.boolean(),
});
export type MyGroupSummary = z.infer<typeof MyGroupSummarySchema>;

export const MyGroupsResponseSchema = z.object({ groups: z.array(MyGroupSummarySchema) });
export type MyGroupsResponse = z.infer<typeof MyGroupsResponseSchema>;

export const UsualTrainingTimeSchema = z.object({
  usualTrainingTimeId: z.number().int(),
  weekday: WeekdaySchema,
  startsAt: z.string(),
  durationMinutes: z.number().int(),
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
});
export type UsualTrainingTime = z.infer<typeof UsualTrainingTimeSchema>;

export const GroupHubSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  picture: PictureSchema.nullable(),
  pictureEditing: PictureEditingSchema.nullable(),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindId: z.number().int().nullable(),
  groupKindName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  tone: GroupToneSchema.nullable(),
  icon: ClubIconSchema.nullable(),
  usualTrainingTimes: z.array(UsualTrainingTimeSchema),
  admins: z.array(GroupDetailAdminSchema),
  members: z.array(GroupDetailMemberSchema),
  viewerIsMember: z.boolean(),
  viewerIsAdmin: z.boolean(),
  viewerMayManage: z.boolean(),
  viewerSince: z.iso.date().nullable(),
  pastMembers: z.array(GroupDetailMemberSchema),
  pastAdmins: z.array(GroupDetailAdminSchema),
});
export type GroupHub = z.infer<typeof GroupHubSchema>;

export const PersonSearchResponseSchema = z.object({ persons: z.array(PersonRefSchema) });
export type PersonSearchResponse = z.infer<typeof PersonSearchResponseSchema>;

export const AddedGroupMembershipSchema = z.object({ groupMembershipId: z.number().int() });
export type AddedGroupMembership = z.infer<typeof AddedGroupMembershipSchema>;

export const DESCRIPTION_MAX_LENGTH = 400;
export const DESCRIPTION_TOO_LONG_MESSAGE = `Die Beschreibung darf höchstens ${DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`;
export const EARLIEST_FOUNDED_YEAR = 1800;
export const LATEST_FOUNDED_YEAR = 2100;
export const FOUNDED_YEAR_MESSAGE = `Gib ein Jahr zwischen ${EARLIEST_FOUNDED_YEAR} und ${LATEST_FOUNDED_YEAR} ein.`;

const FOUNDED_YEAR_PATTERN = /^\d{4}$/;

const isFoundedYearInRange = (value: string): boolean => {
  const year = Number(value);

  return year >= EARLIEST_FOUNDED_YEAR && year <= LATEST_FOUNDED_YEAR;
};

export const GROUP_NAME_MAX_LENGTH = 80;
export const GROUP_NAME_REQUIRED_MESSAGE = 'Die Gruppe braucht einen Namen.';
export const GROUP_NAME_TOO_LONG_MESSAGE = `Höchstens ${GROUP_NAME_MAX_LENGTH} Zeichen.`;

export const GroupAdministrationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, GROUP_NAME_REQUIRED_MESSAGE)
    .max(GROUP_NAME_MAX_LENGTH, GROUP_NAME_TOO_LONG_MESSAGE),
  groupKindId: z.string(),
});
export type GroupAdministrationForm = z.infer<typeof GroupAdministrationFormSchema>;

export const GroupInfoFormSchema = z.object({
  description: z.string().max(DESCRIPTION_MAX_LENGTH, DESCRIPTION_TOO_LONG_MESSAGE),
  isRecruiting: z.boolean(),
  groupKindId: z.string(),
  foundedYear: z
    .string()
    .trim()
    .regex(FOUNDED_YEAR_PATTERN, FOUNDED_YEAR_MESSAGE)
    .refine(isFoundedYearInRange, FOUNDED_YEAR_MESSAGE)
    .or(z.literal('')),
  tone: GroupToneSchema.or(z.literal('')),
  icon: ClubIconSchema.nullable(),
});
export type GroupInfoForm = z.infer<typeof GroupInfoFormSchema>;

export const AddGroupMembershipFormSchema = z.object({
  personId: z.number().int().positive(),
  joinedOn: z.iso.date(),
});
export type AddGroupMembershipForm = z.infer<typeof AddGroupMembershipFormSchema>;

export const EndGroupMembershipFormSchema = z.object({
  groupMembershipId: z.number().int().positive(),
  endedOn: z.iso.date(),
});
export type EndGroupMembershipForm = z.infer<typeof EndGroupMembershipFormSchema>;

export const AddedGroupAdminSchema = z.object({ groupAdminId: z.number().int() });
export type AddedGroupAdmin = z.infer<typeof AddedGroupAdminSchema>;

export const AddGroupAdminFormSchema = z.object({
  personId: z.number().int().positive(),
  function: z.string().max(64).nullable(),
  sinceOn: z.iso.date(),
});
export type AddGroupAdminForm = z.infer<typeof AddGroupAdminFormSchema>;

export const EndGroupAdminFormSchema = z.object({
  groupAdminId: z.number().int().positive(),
  endedOn: z.iso.date(),
});
export type EndGroupAdminForm = z.infer<typeof EndGroupAdminFormSchema>;

export const ADMIN_FUNCTION_MAX_LENGTH = 64;

export const GroupMembershipJoinFormSchema = z.object({
  person: requiredPerson('Wähle die Person, die in die Gruppe kommt.'),
  joinedOn: requiredDay('Der erste Tag fehlt.'),
  makeAdmin: z.boolean(),
  functionLabel: z.string().max(ADMIN_FUNCTION_MAX_LENGTH),
});

export const GroupMembershipEndFormSchema = z.object({
  endedOn: requiredDay('Der letzte Tag fehlt.'),
});

export const GroupAdminAppointFormSchema = z.object({
  person: requiredPerson('Wähle die Person, die Gruppen-Admin wird.'),
  functionLabel: z.string().max(ADMIN_FUNCTION_MAX_LENGTH),
  sinceOn: requiredDay('Der erste Tag fehlt.'),
});

export const GroupAdminEndFormSchema = z.object({
  endedOn: requiredDay('Der letzte Tag fehlt.'),
});

export const TRAINING_DURATION_MINUTES = { min: 15, max: 480 } as const;
export const MAX_USUAL_TRAINING_TIMES = 14;

export const TRAINING_DURATION_MESSAGE = 'Die Dauer muss zwischen 15 und 480 Minuten liegen.';

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const UsualTrainingTimeFormSchema = z.object({
  weekday: WeekdaySchema,
  startsAt: z.string().regex(CLOCK_TIME_PATTERN),
  durationMinutes: z
    .number()
    .int()
    .min(TRAINING_DURATION_MINUTES.min, TRAINING_DURATION_MESSAGE)
    .max(TRAINING_DURATION_MINUTES.max, TRAINING_DURATION_MESSAGE),
  venueId: z.string(),
});
export type UsualTrainingTimeForm = z.infer<typeof UsualTrainingTimeFormSchema>;

export const GroupCalendarKindSchema = z.enum(CALENDAR_KIND_KEYS);
export type GroupCalendarKind = z.infer<typeof GroupCalendarKindSchema>;

export const GroupCalendarVisibilitySchema = z.enum(['group', 'club', 'public']);
export type GroupCalendarVisibility = z.infer<typeof GroupCalendarVisibilitySchema>;

export const GroupCalendarParticipantSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type GroupCalendarParticipant = z.infer<typeof GroupCalendarParticipantSchema>;

export const GroupCalendarEntrySchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  kind: GroupCalendarKindSchema,
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
  ownerGroupId: z.number().int().nullable(),
  ownerGroupName: z.string().nullable(),
  ownerGroupTone: GroupToneSchema.nullable(),
  participatingGroups: z.array(GroupCalendarParticipantSchema),
  visibility: GroupCalendarVisibilitySchema,
  asksForResponse: z.boolean(),
  description: z.string().nullable(),
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  viewerMayAnswer: z.boolean(),
  isRunning: z.boolean(),
});
export type GroupCalendarEntry = z.infer<typeof GroupCalendarEntrySchema>;

export const GroupCalendarResponseSchema = z.object({
  entries: z.array(GroupCalendarEntrySchema),
});
export type GroupCalendarResponse = z.infer<typeof GroupCalendarResponseSchema>;
