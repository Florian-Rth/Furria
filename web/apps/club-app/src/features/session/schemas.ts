import { z } from 'zod';

export const AppSearchSchema = z.object({
  sheet: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  changed: z.string().optional().catch(undefined),
});
export type AppSearch = z.infer<typeof AppSearchSchema>;
