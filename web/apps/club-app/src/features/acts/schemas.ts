import { ChoreographySchema, createStudioSchemas } from '@furria/studio/studio-schemas';
import { z } from 'zod';
import { AttendanceAnswerSchema } from '@/features/attendance/schemas';
import {
  ActGroupSchema,
  ActKindSchema,
  CatalogueActSchema,
} from '@/features/running-order/schemas';
import { MediaUrlSchema, PictureSchema } from '@/lib/api/schemas';

export const ACTS_FILTERS = [
  'all',
  'dance',
  'speech',
  'music',
  'show',
  'points',
  'archive',
] as const;
export const ActsFilterSchema = z.enum(ACTS_FILTERS);
export type ActsFilter = z.infer<typeof ActsFilterSchema>;

export const NEW_ACT = 'new';

export const ActsSearchSchema = z.object({
  act: z.literal(NEW_ACT).optional().catch(undefined),
  filter: ActsFilterSchema.optional().catch(undefined),
  person: z.coerce.number().int().positive().optional().catch(undefined),
  session: z.coerce.number().int().positive().optional().catch(undefined),
  from: z.coerce.number().int().positive().optional().catch(undefined),
});
export type ActsSearch = z.infer<typeof ActsSearchSchema>;

export const GroupActsSearchSchema = z.object({
  act: z.literal(NEW_ACT).optional().catch(undefined),
});
export type GroupActsSearch = z.infer<typeof GroupActsSearchSchema>;

export const ACT_PAGE_ORIGINS = ['catalogue', 'groupActs', 'group', 'start'] as const;
export const ActPageOriginSchema = z.enum(ACT_PAGE_ORIGINS);
export type ActPageOrigin = z.infer<typeof ActPageOriginSchema>;

export const ActScreenSearchSchema = z.object({
  from: ActPageOriginSchema.optional().catch(undefined),
  group: z.coerce.number().int().positive().optional().catch(undefined),
  event: z.coerce.number().int().positive().optional().catch(undefined),
  filter: ActsFilterSchema.optional().catch(undefined),
  person: z.coerce.number().int().positive().optional().catch(undefined),
  session: z.coerce.number().int().positive().optional().catch(undefined),
});
export type ActScreenSearch = z.infer<typeof ActScreenSearchSchema>;

export const ActPageSearchSchema = ActScreenSearchSchema.extend({
  stepId: z.coerce.number().int().positive().optional().catch(undefined),
  sheet: z.string().optional().catch(undefined),
});
export type ActPageSearch = z.infer<typeof ActPageSearchSchema>;

const { StudioPersonSchema, StudioSchema: StudioWorkSchema } = createStudioSchemas({
  MediaUrlSchema,
  PictureSchema,
});

export const StudioSpotChangeSchema = z.object({
  spotId: z.int(),
  person: StudioPersonSchema.nullable(),
});
export type StudioSpotChange = z.infer<typeof StudioSpotChangeSchema>;

export const EveningChoreographySchema = ChoreographySchema.extend({
  copiedFromVersion: z.int().nullable(),
});
export type EveningChoreography = z.infer<typeof EveningChoreographySchema>;

export const StudioAppearanceSchema = z.object({
  appearanceId: z.int(),
  position: z.int().nullable(),
  added: z.array(StudioPersonSchema),
  removedPersonIds: z.array(z.int()),
  spotChanges: z.array(StudioSpotChangeSchema),
  choreography: EveningChoreographySchema.nullable(),
});
export type StudioAppearance = z.infer<typeof StudioAppearanceSchema>;

export const StudioEveningSchema = z.object({
  eventId: z.int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  appearance: StudioAppearanceSchema.nullable(),
});
export type StudioEvening = z.infer<typeof StudioEveningSchema>;

export const StudioAttendanceChangeSchema = z.object({
  answer: AttendanceAnswerSchema,
  isRecordedOnBehalf: z.boolean(),
  recordedBy: z.string().nullable(),
  recordedAt: z.iso.datetime({ offset: true }),
});
export type StudioAttendanceChange = z.infer<typeof StudioAttendanceChangeSchema>;

export const StudioAttendanceSchema = z.object({
  personId: z.int(),
  answer: AttendanceAnswerSchema,
  isRecordedOnBehalf: z.boolean(),
  recordedBy: z.string().nullable(),
  trail: z.array(StudioAttendanceChangeSchema),
});
export type StudioAttendance = z.infer<typeof StudioAttendanceSchema>;

export const StudioTrainingSchema = z.object({
  calendarEntryId: z.int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  openSpotIds: z.array(z.int()),
  responses: z.array(StudioAttendanceSchema),
});
export type StudioTraining = z.infer<typeof StudioTrainingSchema>;

export const ActStudioSchema = StudioWorkSchema.extend({
  evenings: z.array(StudioEveningSchema),
  trainings: z.array(StudioTrainingSchema),
});
export type ActStudio = z.infer<typeof ActStudioSchema>;

export const CoEditorSchema = StudioPersonSchema.extend({
  grantedAt: z.iso.datetime({ offset: true }),
});
export type CoEditor = z.infer<typeof CoEditorSchema>;

export const ActViewerSchema = z.object({
  inCast: z.boolean(),
  canEditSettings: z.boolean(),
  canEditStudio: z.boolean(),
  canGrantCoEditors: z.boolean(),
  canMarkAttendance: z.boolean(),
});
export type ActViewer = z.infer<typeof ActViewerSchema>;

export const ActStudioResponseSchema = z.object({
  act: CatalogueActSchema,
  viewer: ActViewerSchema,
  coEditors: z.array(CoEditorSchema),
  studio: ActStudioSchema.nullable(),
});
export type ActStudioResponse = z.infer<typeof ActStudioResponseSchema>;

export const GroupActSchema = z.object({
  actId: z.int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  sessionYear: z.int(),
  closed: z.boolean(),
  archived: z.boolean(),
  castSize: z.int(),
  viewerInCast: z.boolean(),
});
export type GroupAct = z.infer<typeof GroupActSchema>;

export const GroupActsResponseSchema = z.object({
  relevantSessionYear: z.int(),
  acts: z.array(GroupActSchema),
});
export type GroupActsResponse = z.infer<typeof GroupActsResponseSchema>;

export const MyActEveningSchema = z.object({
  eventId: z.int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  position: z.int().nullable(),
});
export type MyActEvening = z.infer<typeof MyActEveningSchema>;

export const MyActTrainingSchema = z.object({
  calendarEntryId: z.int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  present: z.int(),
  absent: z.int(),
});
export type MyActTraining = z.infer<typeof MyActTrainingSchema>;

export const MyActSchema = z.object({
  actId: z.int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  sessionYear: z.int(),
  group: ActGroupSchema.nullable(),
  viewerInCast: z.boolean(),
  viewerLeads: z.boolean(),
  playable: z.boolean(),
  cast: z.array(StudioPersonSchema),
  editors: z.array(StudioPersonSchema),
  nextEvening: MyActEveningSchema.nullable(),
  nextTraining: MyActTrainingSchema.nullable(),
});
export type MyAct = z.infer<typeof MyActSchema>;

export const MyActsResponseSchema = z.object({ acts: z.array(MyActSchema) });
export type MyActsResponse = z.infer<typeof MyActsResponseSchema>;
