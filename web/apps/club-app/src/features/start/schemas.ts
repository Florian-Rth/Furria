import { z } from 'zod';
import { MyActSchema } from '@/features/acts/schemas';
import { AttendanceAnswerSchema } from '@/features/attendance/schemas';
import { CalendarEntryAudienceSchema } from '@/features/calendar/schemas';
import { NewsCategorySchema } from '@/features/news/schemas';
import { MentionTargetsSchema } from '@/features/rich-text/schemas';
import { TO_DO_KINDS } from '@/features/to-dos/schemas';
import { knownKindsOnly } from '@/lib/api/known-kinds';
import { MediaItemStateSchema, MediaUrlSchema, PictureSchema } from '@/lib/api/schemas';
import { CALENDAR_KIND_KEYS } from '@/lib/calendar-copy';
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
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  isOwed: z.boolean(),
});
export type StartAttendance = z.infer<typeof StartAttendanceSchema>;

const StartPollOptionSchema = z.object({
  optionId: z.int(),
  label: z.string(),
  viewerChose: z.boolean(),
});
export type StartPollOption = z.infer<typeof StartPollOptionSchema>;

const StartPollSchema = z.object({
  pollId: z.int(),
  position: z.int(),
  question: z.string(),
  allowsMultipleChoices: z.boolean(),
  isAnonymous: z.boolean(),
  isOwed: z.boolean(),
  options: z.array(StartPollOptionSchema),
});
export type StartPoll = z.infer<typeof StartPollSchema>;

const StartSignUpListSchema = z.object({
  signUpListId: z.int(),
  position: z.int(),
  title: z.string(),
  hint: z.string().nullable(),
  isOwed: z.boolean(),
  viewerText: z.string().nullable(),
});
export type StartSignUpList = z.infer<typeof StartSignUpListSchema>;

const StartEventSchema = z.object({
  isCancelled: z.boolean(),
  picture: PictureSchema.nullable(),
});
export type StartEvent = z.infer<typeof StartEventSchema>;

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
  audience: CalendarEntryAudienceSchema,
  audienceGroups: z.array(StartGroupRefSchema),
  viewerGroupIds: z.array(z.int()),
  viewerRuns: StartRunSchema.nullable(),
  attendance: StartAttendanceSchema.nullable(),
  openPolls: z.array(StartPollSchema),
  openSignUpLists: z.array(StartSignUpListSchema),
  description: z.string().nullable(),
  event: StartEventSchema.nullable(),
});
export type StartEntry = z.infer<typeof StartEntrySchema>;

const StartPersonSchema = z.object({
  personId: z.int(),
  firstName: z.string(),
  lastName: z.string(),
  portrait: PictureSchema.nullable(),
  officeName: z.string().nullable(),
});
export type StartPerson = z.infer<typeof StartPersonSchema>;

export const StartAnnouncementSchema = z.object({
  announcementId: z.int(),
  title: z.string(),
  body: z.string(),
  mentions: MentionTargetsSchema,
  publishedAt: z.iso.datetime({ offset: true }),
  validUntil: z.iso.date().nullable(),
  author: StartPersonSchema.nullable(),
});
export type StartAnnouncement = z.infer<typeof StartAnnouncementSchema>;

export const START_MINE_KINDS = [
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

export const StartToDoSchema = z.object({
  kind: z.enum(TO_DO_KINDS),
  count: z.int().positive(),
  group: StartGroupRefSchema.nullable(),
});
export type StartToDo = z.infer<typeof StartToDoSchema>;

export const StartAlbumSchema = z.object({
  albumId: z.int().positive(),
  title: z.string(),
  itemCount: z.int().nonnegative(),
  createdAt: z.iso.datetime({ offset: true }),
  cover: z
    .object({
      mediaItemId: z.int().positive(),
      state: MediaItemStateSchema,
      urls: z.object({ small: MediaUrlSchema }),
    })
    .nullable(),
});
export type StartAlbum = z.infer<typeof StartAlbumSchema>;

export const StartNewsSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  category: NewsCategorySchema,
  publishedAt: z.iso.datetime({ offset: true }),
  picture: PictureSchema.nullable(),
});
export type StartNews = z.infer<typeof StartNewsSchema>;

export const StartBeerTabSchema = z.object({
  beerPotId: z.int().positive(),
  openCrates: z.int().positive(),
  openCents: z.int().positive(),
  oldestOpenBookedAt: z.iso.datetime({ offset: true }),
  owner: StartPersonRefSchema.nullable(),
  paymentLink: z.url({ protocol: /^https$/ }).nullable(),
});
export type StartBeerTab = z.infer<typeof StartBeerTabSchema>;

export const START_PANEL_KINDS = [
  'calendar',
  'announcements',
  'mine',
  'groups',
  'toDos',
  'gallery',
  'news',
  'beerTab',
] as const;

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
  z.object({ kind: z.literal('gallery'), ...Base, albums: z.array(StartAlbumSchema) }),
  z.object({ kind: z.literal('news'), ...Base, news: z.array(StartNewsSchema) }),
  z.object({ kind: z.literal('beerTab'), ...Base, beerTabs: z.array(StartBeerTabSchema) }),
]);
export type StartPanel = z.infer<typeof StartPanelSchema>;
export type StartPanelKind = StartPanel['kind'];

export const StartPracticePanelSchema = z.object({
  kind: z.literal('practice'),
  ...Base,
  acts: z.array(MyActSchema),
});
export type StartPracticePanel = z.infer<typeof StartPracticePanelSchema>;

export const StartBeerDeskPanelSchema = z.object({
  kind: z.literal('beerDesk'),
  ...Base,
  beerPotId: z.int().positive(),
});
export type StartBeerDeskPanel = z.infer<typeof StartBeerDeskPanelSchema>;

export const BoardPanelSchema = z.discriminatedUnion('kind', [
  ...StartPanelSchema.options,
  StartPracticePanelSchema,
  StartBeerDeskPanelSchema,
]);
export type BoardPanel = z.infer<typeof BoardPanelSchema>;

export const StartSchema = z.object({
  asOf: z.iso.datetime({ offset: true }),
  today: z.iso.date(),
  reshapeAt: z.iso.datetime({ offset: true }).nullable(),
  viewerIsActiveInClub: z.boolean(),
  panels: knownKindsOnly(StartPanelSchema, START_PANEL_KINDS),
});
export type Start = z.infer<typeof StartSchema>;
