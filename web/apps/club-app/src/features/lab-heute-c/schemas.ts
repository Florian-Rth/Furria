import { z } from 'zod';

export const CalledMarksSchema = z.array(z.string());
export type CalledMarksList = z.infer<typeof CalledMarksSchema>;
