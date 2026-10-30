import { z } from 'zod';

export const AddedSongSchema = z.object({ songId: z.int() });
export type AddedSong = z.infer<typeof AddedSongSchema>;

export const AddedSpotSchema = z.object({ spotId: z.int(), number: z.int() });
export type AddedSpot = z.infer<typeof AddedSpotSchema>;

export const SavedChoreographySchema = z.object({ version: z.int() });
export type SavedChoreography = z.infer<typeof SavedChoreographySchema>;
export const MarkedStepsSchema = z.object({ stepIds: z.array(z.int()) });
export type MarkedSteps = z.infer<typeof MarkedStepsSchema>;

export const AddedPartSchema = z.object({ partId: z.int() });
export type AddedPart = z.infer<typeof AddedPartSchema>;

export const AddedVideoSchema = z.object({ videoId: z.int() });
export type AddedVideo = z.infer<typeof AddedVideoSchema>;

export const VideoAlignmentSchema = z.object({
  startSeconds: z.number(),
  confidence: z.number(),
});
export type VideoAlignment = z.infer<typeof VideoAlignmentSchema>;
