import { z } from 'zod';

export const STANCE_POSITIONS = ['yes', 'neutral', 'no'] as const;
export type StancePosition = (typeof STANCE_POSITIONS)[number];

export const IMPORTANCES = [1, 2, 3] as const;
export type Importance = (typeof IMPORTANCES)[number];

export const ADMISSION_AGE_BANDS = [
  'underTwelve',
  'twelveToThirteen',
  'fourteenToFifteen',
  'sixteenToSeventeen',
  'eighteenPlus',
] as const;
export type AdmissionAgeBand = (typeof ADMISSION_AGE_BANDS)[number];

export const STATEMENT_STATES = ['answered', 'open', 'new', 'changed'] as const;
export type StatementState = (typeof STATEMENT_STATES)[number];

const ImportanceSchema = z.literal(IMPORTANCES);

export const GroupStatementSchema = z.object({
  statementId: z.int().positive(),
  text: z.string(),
  position: z.enum(STANCE_POSITIONS).nullable(),
  importance: ImportanceSchema.nullable(),
  state: z.enum(STATEMENT_STATES),
});
export type GroupStatement = z.infer<typeof GroupStatementSchema>;

export const GroupMatcherPageSchema = z.object({
  isTakingPart: z.boolean(),
  statements: z.array(GroupStatementSchema),
  admissionAges: z.array(z.enum(ADMISSION_AGE_BANDS)),
});
export type GroupMatcherPage = z.infer<typeof GroupMatcherPageSchema>;

export const GroupMatcherStatusSchema = z.object({
  isTakingPart: z.boolean(),
  openStatements: z.int().nonnegative(),
});
export type GroupMatcherStatus = z.infer<typeof GroupMatcherStatusSchema>;

export const StanceInputSchema = z.object({
  statementId: z.int().positive(),
  position: z.enum(STANCE_POSITIONS),
  importance: ImportanceSchema,
});
export type StanceInput = z.infer<typeof StanceInputSchema>;
