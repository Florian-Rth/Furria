import { z } from 'zod';
import { STATEMENT_STATES } from '@/features/group-matcher/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

export const PoolGroupSchema = z.object({
  groupId: z.int().positive(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
});
export type PoolGroup = z.infer<typeof PoolGroupSchema>;

export const PoolStatementSchema = z.object({
  statementId: z.int().positive(),
  text: z.string(),
  approvedAt: z.iso.datetime({ offset: true }),
  rewordedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type PoolStatement = z.infer<typeof PoolStatementSchema>;

export const WaitingProposalSchema = z.object({
  statementId: z.int().positive(),
  text: z.string(),
  proposedAt: z.iso.datetime({ offset: true }),
  proposedBy: PoolGroupSchema.nullable(),
});
export type WaitingProposal = z.infer<typeof WaitingProposalSchema>;

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
  proposals: z.array(WaitingProposalSchema),
  coverage: z.array(GroupCoverageSchema),
});
export type StatementPool = z.infer<typeof StatementPoolSchema>;

export interface StatementApproval {
  statementId: number;
  text: string | null;
}

export interface StatementWording {
  statementId: number;
  text: string;
}
