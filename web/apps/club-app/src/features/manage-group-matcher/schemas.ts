import { z } from 'zod';
import { STATEMENT_STATES } from '@/features/group-matcher/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

export const PoolGroupSchema = z.object({
  groupId: z.int().positive(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type PoolGroup = z.infer<typeof PoolGroupSchema>;

export const STATEMENT_MAX_LENGTH = 160;
export const STATEMENT_LIMIT = 10;

export const PoolStatementSchema = z.object({
  statementId: z.int().positive(),
  text: z.string(),
  addedAt: z.iso.datetime({ offset: true }),
  rewordedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type PoolStatement = z.infer<typeof PoolStatementSchema>;

export const CoverageCellSchema = z.object({
  statementId: z.int().positive(),
  state: z.enum(STATEMENT_STATES),
});
export type CoverageCell = z.infer<typeof CoverageCellSchema>;

export const GroupCoverageSchema = z.object({
  group: PoolGroupSchema,
  isTakingPart: z.boolean(),
  cells: z.array(CoverageCellSchema),
});
export type GroupCoverage = z.infer<typeof GroupCoverageSchema>;

export const StatementPoolSchema = z.object({
  statements: z.array(PoolStatementSchema),
  coverage: z.array(GroupCoverageSchema),
});
export type StatementPool = z.infer<typeof StatementPoolSchema>;

export const AddedStatementSchema = z.object({ statementId: z.int().positive() });
export type AddedStatement = z.infer<typeof AddedStatementSchema>;

export interface StatementAddition {
  provisionalId: number;
  text: string;
  addedAt: string;
}

export interface StatementWording {
  statementId: number;
  text: string;
}

export const STATEMENT_REQUIRED_MESSAGE = 'Schreib die Aussage auf.';
export const STATEMENT_TOO_LONG_MESSAGE = `Höchstens ${STATEMENT_MAX_LENGTH} Zeichen.`;

export const StatementTextFormSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, STATEMENT_REQUIRED_MESSAGE)
    .max(STATEMENT_MAX_LENGTH, STATEMENT_TOO_LONG_MESSAGE),
});
