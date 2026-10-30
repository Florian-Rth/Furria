import { z } from 'zod';
import {
  ActGroupSchema,
  ActKindSchema,
  CatalogueActSchema,
} from '@/features/running-order/schemas';
import { MediaItemStateSchema, MediaUrlSchema, PictureSchema } from '@/lib/api/schemas';

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

export const ACT_PAGE_ORIGINS = ['catalogue', 'groupActs', 'group', 'start'] as const;
export const ActPageOriginSchema = z.enum(ACT_PAGE_ORIGINS);
export type ActPageOrigin = z.infer<typeof ActPageOriginSchema>;

export const ActPageSearchSchema = z.object({
  from: ActPageOriginSchema.optional().catch(undefined),
  group: z.coerce.number().int().positive().optional().catch(undefined),
  event: z.coerce.number().int().positive().optional().catch(undefined),
  filter: ActsFilterSchema.optional().catch(undefined),
  person: z.coerce.number().int().positive().optional().catch(undefined),
  session: z.coerce.number().int().positive().optional().catch(undefined),
  settings: z.boolean().optional().catch(undefined),
  view: z.enum(['details']).optional().catch(undefined),
});
export type ActPageSearch = z.infer<typeof ActPageSearchSchema>;

const PlacementSchema = z.enum(['onTimeline', 'cutAway', 'musicMissing']);
const VideoPlacementSchema = z.enum(['onTimeline', 'cutAway', 'musicMissing', 'unaligned']);

const AudioUrlsSchema = z.object({
  normalised: MediaUrlSchema,
  preview: MediaUrlSchema,
  peaks: MediaUrlSchema,
});

export const StudioSongSchema = z.object({
  songId: z.int(),
  mediaItemId: z.int(),
  position: z.int(),
  startSeconds: z.number(),
  endSeconds: z.number(),
  firstBeatSeconds: z.number().nullable(),
  tempoBpm: z.number().nullable(),
  state: MediaItemStateSchema,
  durationSeconds: z.number().nullable(),
  fileName: z.string(),
  urls: AudioUrlsSchema,
});
export type StudioSong = z.infer<typeof StudioSongSchema>;

export const StudioFinalTrackSchema = z.object({
  finalTrackId: z.int(),
  mediaItemId: z.int(),
  version: z.int(),
  adopted: z.boolean(),
  state: MediaItemStateSchema,
  durationSeconds: z.number().nullable(),
  urls: AudioUrlsSchema,
});
export type StudioFinalTrack = z.infer<typeof StudioFinalTrackSchema>;

export const StudioStepSchema = z.object({
  stepId: z.int(),
  name: z.string(),
  description: z.string().nullable(),
  startSeconds: z.number().nullable(),
  endSeconds: z.number().nullable(),
  placement: PlacementSchema,
});
export type StudioStep = z.infer<typeof StudioStepSchema>;

export const StudioPartSchema = z.object({
  partId: z.int(),
  name: z.string(),
  stepIds: z.array(z.int()),
  mainVideoId: z.int().nullable(),
  adrift: z.boolean(),
});
export type StudioPart = z.infer<typeof StudioPartSchema>;

const StudioPersonSchema = z.object({
  personId: z.int(),
  firstName: z.string(),
  lastName: z.string(),
  portrait: PictureSchema.nullable(),
});

export const StudioSpotSchema = z.object({
  spotId: z.int(),
  number: z.int(),
  person: StudioPersonSchema.nullable(),
});
export type StudioSpot = z.infer<typeof StudioSpotSchema>;

export const StudioVideoSchema = z.object({
  videoId: z.int(),
  mediaItemId: z.int(),
  name: z.string().nullable(),
  state: MediaItemStateSchema,
  durationSeconds: z.number().nullable(),
  startSeconds: z.number().nullable(),
  placement: VideoPlacementSchema,
  outdated: z.boolean(),
  urls: z.object({ video: MediaUrlSchema, compact: MediaUrlSchema, poster: MediaUrlSchema }),
});
export type StudioVideo = z.infer<typeof StudioVideoSchema>;

const StagePointSchema = z.object({ rightMetres: z.number(), backMetres: z.number() });

export const KeyframeSchema = z.object({
  sourceMediaItemId: z.int(),
  seconds: z.number(),
  position: StagePointSchema,
  bend: StagePointSchema.nullable(),
  easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']),
  facingDegrees: z.number().nullable(),
});
export type Keyframe = z.infer<typeof KeyframeSchema>;

export const ChoreographySchema = z.object({
  version: z.int(),
  tracks: z.array(z.object({ spotId: z.int(), keyframes: z.array(KeyframeSchema) })),
});
export type Choreography = z.infer<typeof ChoreographySchema>;

export const StudioStageSchema = z.object({
  widthMetres: z.number(),
  depthMetres: z.number(),
  artworkSvg: z.string().nullable(),
});
export type StudioStage = z.infer<typeof StudioStageSchema>;

export const StudioSchema = z.object({
  music: z.object({
    lengthSeconds: z.number(),
    source: z.enum(['workingMix', 'finalTrack']),
  }),
  songs: z.array(StudioSongSchema),
  finalTracks: z.array(StudioFinalTrackSchema),
  steps: z.array(StudioStepSchema),
  parts: z.array(StudioPartSchema),
  spots: z.array(StudioSpotSchema),
  videos: z.array(StudioVideoSchema),
  choreography: ChoreographySchema.nullable(),
  stage: StudioStageSchema.nullable(),
});
export type Studio = z.infer<typeof StudioSchema>;

export const CoEditorSchema = StudioPersonSchema.extend({
  grantedAt: z.iso.datetime({ offset: true }),
});
export type CoEditor = z.infer<typeof CoEditorSchema>;

export const ActViewerSchema = z.object({
  inCast: z.boolean(),
  canEditSettings: z.boolean(),
  canEditStudio: z.boolean(),
  canGrantCoEditors: z.boolean(),
});
export type ActViewer = z.infer<typeof ActViewerSchema>;

export const ActStudioResponseSchema = z.object({
  act: CatalogueActSchema,
  viewer: ActViewerSchema,
  coEditors: z.array(CoEditorSchema),
  studio: StudioSchema.nullable(),
});
export type ActStudioResponse = z.infer<typeof ActStudioResponseSchema>;

export const GroupActSchema = z.object({
  actId: z.int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  sessionYear: z.int(),
  closed: z.boolean(),
  viewerInCast: z.boolean(),
});
export type GroupAct = z.infer<typeof GroupActSchema>;

export const GroupActsResponseSchema = z.object({
  relevantSessionYear: z.int(),
  acts: z.array(GroupActSchema),
});
export type GroupActsResponse = z.infer<typeof GroupActsResponseSchema>;

export const MyActSchema = z.object({
  actId: z.int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  sessionYear: z.int(),
  group: ActGroupSchema.nullable(),
});
export type MyAct = z.infer<typeof MyActSchema>;

export const MyActsResponseSchema = z.object({ acts: z.array(MyActSchema) });
export type MyActsResponse = z.infer<typeof MyActsResponseSchema>;
