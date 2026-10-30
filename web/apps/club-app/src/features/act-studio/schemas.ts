import { z } from 'zod';

export const AddedSongSchema = z.object({ songId: z.int() });
export type AddedSong = z.infer<typeof AddedSongSchema>;

export const MarkedStepsSchema = z.object({ stepIds: z.array(z.int()) });
export type MarkedSteps = z.infer<typeof MarkedStepsSchema>;

export const AddedPartSchema = z.object({ partId: z.int() });
export type AddedPart = z.infer<typeof AddedPartSchema>;
