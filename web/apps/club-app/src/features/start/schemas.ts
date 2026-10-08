import { z } from 'zod';
import { TO_DO_KINDS } from '@/features/to-dos/schemas';
import { knownKindsOnly } from '@/lib/api/known-kinds';
import { ATTENDANCE_ANSWER_KEYS, CALENDAR_KIND_KEYS } from '@/lib/calendar-copy';
import { GroupToneSchema } from '@/lib/group-tone';

const StartGroupRefSchema = z.object({
  groupId: z.int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type StartGroupRef = z.infer<typeof StartGroupRefSchema>;

const StartVenueSchema = z.object({
  venueId: z.int(),
  name: z.string(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  hint: z.string().nullable(),
});
export type StartVenue = z.infer<typeof StartVenueSchema>;

const StartRunSchema = z.object({ groupId: z.int(), function: z.string().nullable() });
export type StartRun = z.infer<typeof StartRunSchema>;

const StartAttendanceSchema = z.object({
  viewerAnswer: z.enum(ATTENDANCE_ANSWER_KEYS).nullable(),
  isOwed: z.boolean(),
});
export type StartAttendance = z.infer<typeof StartAttendanceSchema>;

export const StartEntrySchema = z.object({
  calendarEntryId: z.int(),
  title: z.string(),
  kind: z.enum(CALENDAR_KIND_KEYS),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  isRunning: z.boolean(),
  venue: StartVenueSchema.nullable(),
  viewerHoldsVenueKey: z.boolean(),
  ownerGroup: StartGroupRefSchema.nullable(),
  participatingGroups: z.array(StartGroupRefSchema),
  viewerGroupIds: z.array(z.int()),
  viewerRuns: StartRunSchema.nullable(),
  attendance: StartAttendanceSchema.nullable(),
  description: z.string().nullable(),
});
export type StartEntry = z.infer<typeof StartEntrySchema>;

const StartPersonSchema = z.object({
  personId: z.int(),
  firstName: z.string(),
  lastName: z.string(),
  portraitUrl: z.string().nullable(),
  officeName: z.string().nullable(),
});
export type StartPerson = z.infer<typeof StartPersonSchema>;

export const StartAnnouncementSchema = z.object({
  announcementId: z.int(),
  title: z.string(),
  body: z.string(),
  publishedAt: z.iso.datetime({ offset: true }),
  validUntil: z.iso.date().nullable(),
  author: StartPersonSchema.nullable(),
});
export type StartAnnouncement = z.infer<typeof StartAnnouncementSchema>;

export const START_MINE_KINDS = [
  'newRole',
  'newBoardSeat',
  'newGroupAdmin',
  'newGroupMembership',
  'newKey',
  'contactChangedByOther',
  'membershipEnding',
  'membershipPaused',
  'milestone',
] as const;
export type StartMineKind = (typeof START_MINE_KINDS)[number];

const StartPersonRefSchema = z.object({
  personId: z.int(),
  firstName: z.string(),
  lastName: z.string(),
});
export type StartPersonRef = z.infer<typeof StartPersonRefSchema>;

export const StartMineSchema = z.object({
  kind: z.enum(START_MINE_KINDS),
  subjectId: z.int().nullable(),
  on: z.iso.date(),
  until: z.iso.date(),
  name: z.string().nullable(),
  groupTone: GroupToneSchema.nullable(),
  function: z.string().nullable(),
  changedBy: StartPersonRefSchema.nullable(),
  sessionStartYear: z.int().nullable(),
  years: z.int().nullable(),
  permissionKeys: z.array(z.string()).nullable(),
});
export type StartMine = z.infer<typeof StartMineSchema>;

export const START_GROUP_MOMENT_KINDS = ['jubilee'] as const;
export type StartGroupMomentKind = (typeof START_GROUP_MOMENT_KINDS)[number];

export const StartGroupMomentSchema = z.object({
  kind: z.literal('jubilee'),
  groupId: z.int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
  years: z.int(),
  foundedYear: z.int(),
  until: z.iso.date(),
});
export type StartGroupMoment = z.infer<typeof StartGroupMomentSchema>;

export const StartToDoSchema = z.object({ kind: z.enum(TO_DO_KINDS), count: z.int().positive() });
export type StartToDo = z.infer<typeof StartToDoSchema>;

export const START_PANEL_KINDS = ['calendar', 'announcements', 'mine', 'groups', 'toDos'] as const;

const Base = { shownCount: z.int().nonnegative() };

export const StartPanelSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('calendar'), ...Base, entries: z.array(StartEntrySchema) }),
  z.object({
    kind: z.literal('announcements'),
    ...Base,
    announcements: z.array(StartAnnouncementSchema),
  }),
  z.object({
    kind: z.literal('mine'),
    ...Base,
    mine: knownKindsOnly(StartMineSchema, START_MINE_KINDS),
  }),
  z.object({
    kind: z.literal('groups'),
    ...Base,
    groupMoments: knownKindsOnly(StartGroupMomentSchema, START_GROUP_MOMENT_KINDS),
  }),
  z.object({
    kind: z.literal('toDos'),
    ...Base,
    toDos: knownKindsOnly(StartToDoSchema, TO_DO_KINDS),
  }),
]);
export type StartPanel = z.infer<typeof StartPanelSchema>;
export type StartPanelKind = StartPanel['kind'];

export const StartSchema = z.object({
  asOf: z.iso.datetime({ offset: true }),
  today: z.iso.date(),
  reshapeAt: z.iso.datetime({ offset: true }).nullable(),
  viewerIsActiveInClub: z.boolean(),
  panels: knownKindsOnly(StartPanelSchema, START_PANEL_KINDS),
});
export type Start = z.infer<typeof StartSchema>;
