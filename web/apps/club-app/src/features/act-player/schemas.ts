import { z } from 'zod';

export const AudioPeaksSchema = z.object({
  peaksPerSecond: z.number().positive(),
  peaks: z.array(z.number()),
});
export type AudioPeaks = z.infer<typeof AudioPeaksSchema>;
