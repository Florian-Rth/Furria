import { z } from 'zod';

export const AlbumSearchSchema = z.object({
  photo: z.coerce.number().int().positive().optional().catch(undefined),
});

export type AlbumSearch = z.infer<typeof AlbumSearchSchema>;
