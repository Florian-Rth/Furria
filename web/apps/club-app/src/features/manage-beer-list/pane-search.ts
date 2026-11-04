import { z } from 'zod';

export const BeerPaneSearchSchema = z.object({
  person: z.coerce.number().int().positive().optional().catch(undefined),
});
export type BeerPaneSearch = z.infer<typeof BeerPaneSearchSchema>;
