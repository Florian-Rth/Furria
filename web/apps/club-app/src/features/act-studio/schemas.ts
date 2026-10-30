import { z } from 'zod';

export const AddedSongSchema = z.object({ songId: z.int() });
export type AddedSong = z.infer<typeof AddedSongSchema>;

export const AddedSpotSchema = z.object({ spotId: z.int(), number: z.int() });
export type AddedSpot = z.infer<typeof AddedSpotSchema>;

export const SavedChoreographySchema = z.object({ version: z.int() });
export type SavedChoreography = z.infer<typeof SavedChoreographySchema>;
