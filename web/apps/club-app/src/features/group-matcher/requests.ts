import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AdmissionAgeBand, GroupMatcherPage, ProposedStatement, StanceInput } from './schemas';
import { GroupMatcherPageSchema, ProposedStatementSchema } from './schemas';

const groupMatcherPath = (groupId: number): string => `/api/groups/${groupId}/group-matcher`;

export const requestGroupMatcherPage = (
  groupId: number,
  accessToken: string,
): Promise<GroupMatcherPage> =>
  apiFetch(groupMatcherPath(groupId), { schema: GroupMatcherPageSchema, accessToken });

export const requestTakeStance = (
  groupId: number,
  stance: StanceInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${groupMatcherPath(groupId)}/stances/${stance.statementId}`, {
    method: 'PUT',
    body: { position: stance.position, importance: stance.importance },
    schema: NoContentSchema,
    accessToken,
  });

export const requestSetAdmissionAges = (
  groupId: number,
  admissionAges: readonly AdmissionAgeBand[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`${groupMatcherPath(groupId)}/admission-ages`, {
    method: 'PUT',
    body: { admissionAges: [...admissionAges] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestProposeStatement = (
  groupId: number,
  text: string,
  accessToken: string,
): Promise<ProposedStatement> =>
  apiFetch(`${groupMatcherPath(groupId)}/proposals`, {
    method: 'POST',
    body: { text },
    schema: ProposedStatementSchema,
    accessToken,
  });

export const requestWithdrawProposal = (
  groupId: number,
  statementId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${groupMatcherPath(groupId)}/proposals/${statementId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
