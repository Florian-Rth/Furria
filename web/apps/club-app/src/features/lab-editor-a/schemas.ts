import { z } from 'zod';

export const LaneSearchSchema = z.object({
  evening: z.coerce.number().int().positive().optional().catch(undefined),
});
export type LaneSearch = z.infer<typeof LaneSearchSchema>;

export const LaneMusicSearchSchema = LaneSearchSchema.extend({
  tool: z.enum(['music', 'video']).optional().catch(undefined),
});
export type LaneMusicSearch = z.infer<typeof LaneMusicSearchSchema>;
