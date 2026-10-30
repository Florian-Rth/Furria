import { z } from 'zod';

export const HallSearchSchema = z.object({
  training: z.coerce.number().int().positive().optional().catch(undefined),
});
export type HallSearch = z.infer<typeof HallSearchSchema>;
