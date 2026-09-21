import { z } from 'zod';
import { GroupDetailAdminSchema, GroupDetailMemberSchema } from '@/features/group-detail';
import { PersonRefSchema } from '@/lib/api/schemas';
import { ATTENDANCE_ANSWER_KEYS, CALENDAR_KIND_KEYS } from '@/lib/calendar-copy';
import { GroupToneSchema } from '@/lib/group-tone';

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

export const TrainingSlotSchema = z.object({
  groupTrainingSlotId: z.number().int(),
  weekday: WeekdaySchema,
  startsAt: z.string(),
  durationMinutes: z.number().int(),
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
});
export type TrainingSlot = z.infer<typeof TrainingSlotSchema>;

export const TRAINING_PREVIEW_STATES = ['creatable', 'venueTaken', 'alreadyExists'] as const;

export const TrainingPreviewStateSchema = z.enum(TRAINING_PREVIEW_STATES);
export type TrainingPreviewState = z.infer<typeof TrainingPreviewStateSchema>;

export const TrainingCollisionSchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  ownerGroupName: z.string().nullable(),
});
export type TrainingCollision = z.infer<typeof TrainingCollisionSchema>;

export const TrainingPreviewRowSchema = z.object({
  groupTrainingSlotId: z.number().int(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
  state: TrainingPreviewStateSchema,
  venueCollisions: z.array(TrainingCollisionSchema),
});
export type TrainingPreviewRow = z.infer<typeof TrainingPreviewRowSchema>;

export const TrainingPreviewSchema = z.object({
  defaultEndsOn: z.iso.date(),
  endsOn: z.iso.date(),
  rows: z.array(TrainingPreviewRowSchema),
});
export type TrainingPreview = z.infer<typeof TrainingPreviewSchema>;

export const GeneratedTrainingsSchema = z.object({
  createdCount: z.number().int(),
  skippedCount: z.number().int(),
  venueCollisions: z.array(TrainingCollisionSchema),
});
export type GeneratedTrainings = z.infer<typeof GeneratedTrainingsSchema>;

export const GroupHubSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindId: z.number().int().nullable(),
  groupKindName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  tone: GroupToneSchema.nullable(),
  trainingSlots: z.array(TrainingSlotSchema),
  admins: z.array(GroupDetailAdminSchema),
  members: z.array(GroupDetailMemberSchema),
  viewerIsMember: z.boolean(),
  viewerIsAdmin: z.boolean(),
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
export const FOUNDED_YEAR_MESSAGE = 'Trag ein Jahr mit vier Ziffern ein, zum Beispiel 1974.';

const FOUNDED_YEAR_PATTERN = /^(1[5-9]\d{2}|2[0-9]\d{2})$/;

export const GroupInfoFormSchema = z.object({
  description: z.string().max(DESCRIPTION_MAX_LENGTH, DESCRIPTION_TOO_LONG_MESSAGE),
  isRecruiting: z.boolean(),
  groupKindId: z.string(),
  foundedYear: z
    .string()
    .trim()
    .regex(FOUNDED_YEAR_PATTERN, FOUNDED_YEAR_MESSAGE)
    .or(z.literal('')),
  tone: GroupToneSchema.or(z.literal('')),
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

export const TRAINING_DURATION_MINUTES = { min: 15, max: 480 } as const;
export const TRAINING_TITLE_MAX_LENGTH = 120;
export const MAX_TRAINING_SLOTS = 14;

export const TRAINING_TITLE_MESSAGE = 'Die Trainings brauchen einen Titel.';
export const TRAINING_DURATION_MESSAGE = 'Trag eine Dauer zwischen 15 und 480 Minuten ein.';

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const TrainingSlotFormSchema = z.object({
  weekday: WeekdaySchema,
  startsAt: z.string().regex(CLOCK_TIME_PATTERN),
  durationMinutes: z
    .number()
    .int()
    .min(TRAINING_DURATION_MINUTES.min, TRAINING_DURATION_MESSAGE)
    .max(TRAINING_DURATION_MINUTES.max, TRAINING_DURATION_MESSAGE),
  venueId: z.string(),
});
export type TrainingSlotForm = z.infer<typeof TrainingSlotFormSchema>;

export const GenerateTrainingsFormSchema = z.object({
  title: z.string().trim().min(1, TRAINING_TITLE_MESSAGE).max(TRAINING_TITLE_MAX_LENGTH),
  endsOn: z.iso.date(),
});
export type GenerateTrainingsForm = z.infer<typeof GenerateTrainingsFormSchema>;

export const GroupCalendarKindSchema = z.enum(CALENDAR_KIND_KEYS);
export type GroupCalendarKind = z.infer<typeof GroupCalendarKindSchema>;

export const GroupCalendarVisibilitySchema = z.enum(['group', 'club', 'public']);
export type GroupCalendarVisibility = z.infer<typeof GroupCalendarVisibilitySchema>;

export const GroupAttendanceAnswerSchema = z.enum(ATTENDANCE_ANSWER_KEYS);
export type GroupAttendanceAnswer = z.infer<typeof GroupAttendanceAnswerSchema>;

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
  viewerAnswer: GroupAttendanceAnswerSchema.nullable(),
  isRunning: z.boolean(),
});
export type GroupCalendarEntry = z.infer<typeof GroupCalendarEntrySchema>;

export const GroupCalendarResponseSchema = z.object({
  entries: z.array(GroupCalendarEntrySchema),
});
export type GroupCalendarResponse = z.infer<typeof GroupCalendarResponseSchema>;
