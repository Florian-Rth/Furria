import { z } from 'zod';
import { PortraitPersonRefSchema } from '@/lib/api/schemas';

export const AddedSongSchema = z.object({ songId: z.int() });
export type AddedSong = z.infer<typeof AddedSongSchema>;

export const AddedSpotSchema = z.object({ spotId: z.int(), number: z.int() });
export type AddedSpot = z.infer<typeof AddedSpotSchema>;

export const SavedChoreographySchema = z.object({ version: z.int() });
export type SavedChoreography = z.infer<typeof SavedChoreographySchema>;

export const AddedStepSchema = z.object({ stepId: z.int() });
export type AddedStep = z.infer<typeof AddedStepSchema>;

export const AddedPartSchema = z.object({ partId: z.int() });
export type AddedPart = z.infer<typeof AddedPartSchema>;

export const AddedVideoSchema = z.object({ videoId: z.int() });
export type AddedVideo = z.infer<typeof AddedVideoSchema>;

export const SplitVideoSchema = z.object({ videoId: z.int() });
export type SplitVideo = z.infer<typeof SplitVideoSchema>;

export const SplitSongSchema = z.object({ songId: z.int() });
export type SplitSong = z.infer<typeof SplitSongSchema>;

export const CHOREOGRAPHY_VERSION_KINDS = [
  'saved',
  'restored',
  'spotRemoved',
  'musicReplaced',
] as const;

export const ChoreographyVersionSchema = z.object({
  version: z.int(),
  kind: z.enum(CHOREOGRAPHY_VERSION_KINDS),
  restoredFromVersion: z.int().nullable(),
  savedAt: z.iso.datetime({ offset: true }),
  savedBy: PortraitPersonRefSchema.nullable(),
});
export type ChoreographyVersion = z.infer<typeof ChoreographyVersionSchema>;

export const ChoreographyVersionPageSchema = z.object({
  versions: z.array(ChoreographyVersionSchema),
  total: z.int(),
  hasOlder: z.boolean(),
});
export type ChoreographyVersionPage = z.infer<typeof ChoreographyVersionPageSchema>;

export const ChoreographyConflictSchema = z.object({
  overlaps: z.array(
    z.object({
      spotId: z.int(),
      keyframes: z.array(z.object({ sourceMediaItemId: z.int(), seconds: z.number() })),
    }),
  ),
});
export type ChoreographyConflict = z.infer<typeof ChoreographyConflictSchema>;
