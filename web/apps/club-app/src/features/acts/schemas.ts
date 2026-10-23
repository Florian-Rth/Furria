import { z } from 'zod';

export const ACTS_FILTERS = [
  'all',
  'dance',
  'speech',
  'music',
  'show',
  'points',
  'archive',
] as const;
export const ActsFilterSchema = z.enum(ACTS_FILTERS);
export type ActsFilter = z.infer<typeof ActsFilterSchema>;

export const NEW_ACT = 'new';

export const ActSelectionSchema = z.union([z.literal(NEW_ACT), z.coerce.number().int().positive()]);
export type ActSelection = z.infer<typeof ActSelectionSchema>;

export const ActsSearchSchema = z.object({
  act: ActSelectionSchema.optional().catch(undefined),
  filter: ActsFilterSchema.optional().catch(undefined),
  person: z.coerce.number().int().positive().optional().catch(undefined),
  from: z.coerce.number().int().positive().optional().catch(undefined),
});
export type ActsSearch = z.infer<typeof ActsSearchSchema>;
