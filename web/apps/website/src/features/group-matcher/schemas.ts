import { z } from 'zod';
import { PublicGroupSchema } from '@/lib/public-groups/schemas';

export const MatcherAnswersSchema = z.record(z.string(), z.string());

export type MatcherAnswers = z.infer<typeof MatcherAnswersSchema>;

export const StanceSchema = z.enum(['yes', 'neutral', 'no']);

export type Stance = z.infer<typeof StanceSchema>;

export const ImportanceSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export type Importance = z.infer<typeof ImportanceSchema>;

export const ADMISSION_AGE_BANDS = [
  'underTwelve',
  'twelveToThirteen',
  'fourteenToFifteen',
  'sixteenToSeventeen',
  'eighteenPlus',
] as const;

export const AdmissionAgeBandSchema = z.enum(ADMISSION_AGE_BANDS);

export type AdmissionAgeBand = z.infer<typeof AdmissionAgeBandSchema>;

export const PublicStanceSchema = z.object({
  groupId: z.number().int().positive(),
  position: StanceSchema,
  importance: ImportanceSchema,
});

export const PublicStatementSchema = z.object({
  statementId: z.number().int().positive(),
  text: z.string().min(1),
  stances: z.array(PublicStanceSchema),
});

export type PublicStatement = z.infer<typeof PublicStatementSchema>;

export const PublicAdmissionAgesSchema = z.object({
  groupId: z.number().int().positive(),
  bands: z.array(AdmissionAgeBandSchema),
});

export type PublicAdmissionAges = z.infer<typeof PublicAdmissionAgesSchema>;

export const PublicGroupMatcherResponseSchema = z.object({
  groups: z.array(PublicGroupSchema),
  statements: z.array(PublicStatementSchema),
  admissionAges: z.array(PublicAdmissionAgesSchema),
});

export type PublicGroupMatcherResponse = z.infer<typeof PublicGroupMatcherResponseSchema>;
