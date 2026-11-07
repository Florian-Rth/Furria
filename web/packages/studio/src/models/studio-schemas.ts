import type { MediaSchemas } from '@furria/api-client/media-schemas';
import { MediaItemStateSchema } from '@furria/api-client/media-schemas';
import { z } from 'zod';

export const AudioPeaksSchema = z.object({
  peaksPerSecond: z.number().positive(),
  peaks: z.array(z.number()),
});
export type AudioPeaks = z.infer<typeof AudioPeaksSchema>;

export const VideoAlignmentSchema = z.object({
  startSeconds: z.number(),
  confidence: z.number(),
});
export type VideoAlignment = z.infer<typeof VideoAlignmentSchema>;

export const SongPieceSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
});
export type SongPiece = z.infer<typeof SongPieceSchema>;

export const FinalTrackMatchesSchema = z.object({
  matches: z.array(
    z.object({
      sourceMediaItemId: z.int(),
      fromSeconds: z.number(),
      offsetSeconds: z.number(),
      stretch: z.number().positive(),
      confidence: z.number(),
    }),
  ),
});
export type FinalTrackMatches = z.infer<typeof FinalTrackMatchesSchema>;

export const StudioMusicToolSchema = z.enum(['music', 'video']);
export type StudioMusicTool = z.infer<typeof StudioMusicToolSchema>;

const PlacementSchema = z.enum(['onTimeline', 'cutAway', 'musicMissing']);
const VideoPlacementSchema = z.enum(['onTimeline', 'cutAway', 'musicMissing', 'unaligned']);

export const StudioMusicSchema = z.object({
  lengthSeconds: z.number(),
  source: z.enum(['workingMix', 'finalTrack']),
});
export type StudioMusic = z.infer<typeof StudioMusicSchema>;

export const StudioStepSchema = z.object({
  stepId: z.int(),
  name: z.string(),
  startSeconds: z.number().nullable(),
  endSeconds: z.number().nullable(),
  placement: PlacementSchema,
});
export type StudioStep = z.infer<typeof StudioStepSchema>;

export const StudioPartSchema = z.object({
  partId: z.int(),
  name: z.string(),
  firstStepId: z.int(),
  lastStepId: z.int(),
  stepIds: z.array(z.int()),
  mainVideoId: z.int().nullable(),
  adrift: z.boolean(),
});
export type StudioPart = z.infer<typeof StudioPartSchema>;

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

type MediaUrlSchema = MediaSchemas['MediaUrlSchema'];

export type StudioMediaSchemas = Pick<MediaSchemas, 'MediaUrlSchema' | 'PictureSchema'>;

type AudioUrlsSchema = z.ZodObject<{
  normalised: MediaUrlSchema;
  preview: MediaUrlSchema;
  peaks: MediaUrlSchema;
}>;

type StudioSongSchema = z.ZodObject<{
  songId: z.ZodInt;
  mediaItemId: z.ZodInt;
  position: z.ZodInt;
  pieces: z.ZodArray<typeof SongPieceSchema>;
  firstBeatSeconds: z.ZodNullable<z.ZodNumber>;
  tempoBpm: z.ZodNullable<z.ZodNumber>;
  state: typeof MediaItemStateSchema;
  durationSeconds: z.ZodNullable<z.ZodNumber>;
  fileName: z.ZodString;
  urls: AudioUrlsSchema;
}>;

type StudioFinalTrackSchema = z.ZodObject<{
  finalTrackId: z.ZodInt;
  mediaItemId: z.ZodInt;
  version: z.ZodInt;
  adopted: z.ZodBoolean;
  state: typeof MediaItemStateSchema;
  durationSeconds: z.ZodNullable<z.ZodNumber>;
  fileName: z.ZodString;
  firstBeatSeconds: z.ZodNullable<z.ZodNumber>;
  tempoBpm: z.ZodNullable<z.ZodNumber>;
  alignments: z.ZodArray<
    z.ZodObject<{
      sourceMediaItemId: z.ZodInt;
      fromSeconds: z.ZodNumber;
      offsetSeconds: z.ZodNumber;
      stretch: z.ZodNumber;
    }>
  >;
  urls: AudioUrlsSchema;
}>;

type StudioPersonSchema = z.ZodObject<{
  personId: z.ZodInt;
  firstName: z.ZodString;
  lastName: z.ZodString;
  portrait: z.ZodNullable<MediaSchemas['PictureSchema']>;
}>;

type StudioSpotSchema = z.ZodObject<{
  spotId: z.ZodInt;
  number: z.ZodInt;
  person: z.ZodNullable<StudioPersonSchema>;
}>;

type StudioVideoSchema = z.ZodObject<{
  videoId: z.ZodInt;
  mediaItemId: z.ZodInt;
  name: z.ZodNullable<z.ZodString>;
  state: typeof MediaItemStateSchema;
  durationSeconds: z.ZodNullable<z.ZodNumber>;
  startSeconds: z.ZodNullable<z.ZodNumber>;
  clipStartSeconds: z.ZodNumber;
  clipEndSeconds: z.ZodNullable<z.ZodNumber>;
  placement: typeof VideoPlacementSchema;
  outdated: z.ZodBoolean;
  urls: z.ZodObject<{
    video: MediaUrlSchema;
    compact: MediaUrlSchema;
    poster: MediaUrlSchema;
    peaks: MediaUrlSchema;
  }>;
}>;

type StudioSchema = z.ZodObject<{
  music: typeof StudioMusicSchema;
  songs: z.ZodArray<StudioSongSchema>;
  finalTracks: z.ZodArray<StudioFinalTrackSchema>;
  steps: z.ZodArray<typeof StudioStepSchema>;
  parts: z.ZodArray<typeof StudioPartSchema>;
  spots: z.ZodArray<StudioSpotSchema>;
  videos: z.ZodArray<StudioVideoSchema>;
  choreography: z.ZodNullable<typeof ChoreographySchema>;
  stage: z.ZodNullable<typeof StudioStageSchema>;
}>;

export interface StudioSchemas {
  StudioPersonSchema: StudioPersonSchema;
  StudioSchema: StudioSchema;
}

export const createStudioSchemas = ({
  MediaUrlSchema,
  PictureSchema,
}: StudioMediaSchemas): StudioSchemas => {
  const AudioUrlsSchema = z.object({
    normalised: MediaUrlSchema,
    preview: MediaUrlSchema,
    peaks: MediaUrlSchema,
  });
  const StudioSongSchema = z.object({
    songId: z.int(),
    mediaItemId: z.int(),
    position: z.int(),
    pieces: z.array(SongPieceSchema),
    firstBeatSeconds: z.number().nullable(),
    tempoBpm: z.number().nullable(),
    state: MediaItemStateSchema,
    durationSeconds: z.number().nullable(),
    fileName: z.string(),
    urls: AudioUrlsSchema,
  });
  const StudioFinalTrackSchema = z.object({
    finalTrackId: z.int(),
    mediaItemId: z.int(),
    version: z.int(),
    adopted: z.boolean(),
    state: MediaItemStateSchema,
    durationSeconds: z.number().nullable(),
    fileName: z.string(),
    firstBeatSeconds: z.number().nullable(),
    tempoBpm: z.number().nullable(),
    alignments: z.array(
      z.object({
        sourceMediaItemId: z.int(),
        fromSeconds: z.number(),
        offsetSeconds: z.number(),
        stretch: z.number().positive(),
      }),
    ),
    urls: AudioUrlsSchema,
  });
  const StudioPersonSchema = z.object({
    personId: z.int(),
    firstName: z.string(),
    lastName: z.string(),
    portrait: PictureSchema.nullable(),
  });
  const StudioSpotSchema = z.object({
    spotId: z.int(),
    number: z.int(),
    person: StudioPersonSchema.nullable(),
  });
  const StudioVideoSchema = z.object({
    videoId: z.int(),
    mediaItemId: z.int(),
    name: z.string().nullable(),
    state: MediaItemStateSchema,
    durationSeconds: z.number().nullable(),
    startSeconds: z.number().nullable(),
    clipStartSeconds: z.number(),
    clipEndSeconds: z.number().nullable(),
    placement: VideoPlacementSchema,
    outdated: z.boolean(),
    urls: z.object({
      video: MediaUrlSchema,
      compact: MediaUrlSchema,
      poster: MediaUrlSchema,
      peaks: MediaUrlSchema,
    }),
  });

  return {
    StudioPersonSchema,
    StudioSchema: z.object({
      music: StudioMusicSchema,
      songs: z.array(StudioSongSchema),
      finalTracks: z.array(StudioFinalTrackSchema),
      steps: z.array(StudioStepSchema),
      parts: z.array(StudioPartSchema),
      spots: z.array(StudioSpotSchema),
      videos: z.array(StudioVideoSchema),
      choreography: ChoreographySchema.nullable(),
      stage: StudioStageSchema.nullable(),
    }),
  };
};

export type StudioSong = z.infer<StudioSongSchema>;
export type StudioFinalTrack = z.infer<StudioFinalTrackSchema>;
export type StudioPerson = z.infer<StudioPersonSchema>;
export type StudioSpot = z.infer<StudioSpotSchema>;
export type StudioVideo = z.infer<StudioVideoSchema>;
export type Studio = z.infer<StudioSchema>;
