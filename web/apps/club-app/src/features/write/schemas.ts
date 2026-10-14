import { z } from 'zod';

export const WriteDraftSchema = z.object({
  accountId: z.number().int(),
  values: z.record(z.string(), z.json()),
});

export type WriteDraft = z.infer<typeof WriteDraftSchema>;
