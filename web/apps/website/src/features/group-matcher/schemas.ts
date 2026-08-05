import { z } from 'zod';

export const MatcherAnswersSchema = z.record(z.string(), z.string());

export type MatcherAnswers = z.infer<typeof MatcherAnswersSchema>;
