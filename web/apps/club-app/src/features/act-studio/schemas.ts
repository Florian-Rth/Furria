import { z } from 'zod';

export const AddedSongSchema = z.object({ songId: z.int() });
export type AddedSong = z.infer<typeof AddedSongSchema>;
