import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AddedStatement, StatementPool, StatementWording } from './schemas';
import { AddedStatementSchema, StatementPoolSchema } from './schemas';

const POOL_PATH = '/api/manage/group-matcher';
const statementPath = (statementId: number): string => `${POOL_PATH}/statements/${statementId}`;

export const requestStatementPool = (accessToken: string): Promise<StatementPool> =>
  apiFetch(POOL_PATH, { schema: StatementPoolSchema, accessToken });

export const requestAddStatement = (text: string, accessToken: string): Promise<AddedStatement> =>
  apiFetch(`${POOL_PATH}/statements`, {
    method: 'POST',
    body: { text },
    schema: AddedStatementSchema,
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
