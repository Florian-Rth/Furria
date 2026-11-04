import { z } from 'zod';

export const HallBuilderSearchSchema = z.object({
  event: z.coerce.number().int().positive().optional().catch(undefined),
});
export type HallBuilderSearch = z.infer<typeof HallBuilderSearchSchema>;
