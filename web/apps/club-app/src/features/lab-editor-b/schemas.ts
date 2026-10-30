import { z } from 'zod';

export const EightsSearchSchema = z.object({
  evening: z.coerce.number().int().positive().optional().catch(undefined),
  zoom: z.enum(['half', 'eight', 'two', 'all']).optional().catch(undefined),
});
export type EightsSearch = z.infer<typeof EightsSearchSchema>;

export const EightsMusicSearchSchema = z.object({
  evening: z.coerce.number().int().positive().optional().catch(undefined),
  tab: z.enum(['music', 'video']).optional().catch(undefined),
});
export type EightsMusicSearch = z.infer<typeof EightsMusicSearchSchema>;
