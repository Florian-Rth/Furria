import { z } from 'zod';

export const RunningGroupKindSchema = z.object({
  groupKindId: z.number().int(),
  name: z.string(),
});
export type RunningGroupKind = z.infer<typeof RunningGroupKindSchema>;

export const GroupKindsResponseSchema = z.object({
  kinds: z.array(RunningGroupKindSchema),
});
export type GroupKindsResponse = z.infer<typeof GroupKindsResponseSchema>;
