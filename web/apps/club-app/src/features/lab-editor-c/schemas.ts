import { z } from 'zod';

export const FocusSearchSchema = z.object({
  evening: z.coerce.number().int().positive().optional().catch(undefined),
});
export type FocusSearch = z.infer<typeof FocusSearchSchema>;

export const FocusMusicToolSchema = z.enum(['music', 'video']);
export type FocusMusicTool = z.infer<typeof FocusMusicToolSchema>;

export const FocusMusicSearchSchema = z.object({
  tool: FocusMusicToolSchema.optional().catch(undefined),
});
export type FocusMusicSearch = z.infer<typeof FocusMusicSearchSchema>;
