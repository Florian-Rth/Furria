import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { StatementApproval, StatementPool, StatementWording } from './schemas';
import { StatementPoolSchema } from './schemas';

const POOL_PATH = '/api/manage/group-matcher';
const statementPath = (statementId: number): string => `${POOL_PATH}/statements/${statementId}`;

export const requestStatementPool = (accessToken: string): Promise<StatementPool> =>
  apiFetch(POOL_PATH, { schema: StatementPoolSchema, accessToken });

export const requestApproveStatement = (
  { statementId, text }: StatementApproval,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${statementPath(statementId)}/approval`, {
    method: 'POST',
    body: text === null ? {} : { text },
    schema: NoContentSchema,
    accessToken,
  });

export const requestRejectStatement = (statementId: number, accessToken: string): Promise<void> =>
  apiFetch(`${statementPath(statementId)}/rejection`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestRewordStatement = (
  { statementId, text }: StatementWording,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${statementPath(statementId)}/text`, {
    method: 'PUT',
    body: { text },
    schema: NoContentSchema,
    accessToken,
  });

export const requestReorderStatements = (
  statementIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`${POOL_PATH}/statement-order`, {
    method: 'PUT',
    body: { statementIds: [...statementIds] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestDeleteStatement = (statementId: number, accessToken: string): Promise<void> =>
  apiFetch(statementPath(statementId), {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
