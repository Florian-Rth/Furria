import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { ADDED_MESSAGE, DELETED_MESSAGE, REWORDED_MESSAGE } from './group-matcher-hub-copy';
import {
  requestAddStatement,
  requestDeleteStatement,
  requestReorderStatements,
  requestRewordStatement,
  requestStatementPool,
} from './requests';
import type { AddedStatement, StatementAddition, StatementPool, StatementWording } from './schemas';
import {
  withAddition,
  withoutStatement,
  withRewording,
  withStatementOrder,
} from './statement-pool';

const FAILURE_NOTICE = { failure: toWriteErrorMessage };
const ORDER_WRITES = 'group-matcher-statement-order';

export const useStatementPoolQuery = (): UseQueryResult<StatementPool, Error> =>
  useQuery({
    queryKey: queryKeys.statementPool,
    queryFn: () => withFreshAccessToken(requestStatementPool),
  });

export const useAddStatementMutation = (): UseMutationResult<
  AddedStatement,
  Error,
  StatementAddition
> =>
  useApiMutation({
    request: ({ text }: StatementAddition, accessToken) => requestAddStatement(text, accessToken),
    optimistic: [optimisticPatch(queryKeys.statementPool, withAddition)],
    changes: ['groupMatcher'],
    notice: { success: () => ADDED_MESSAGE, ...FAILURE_NOTICE },
  });

export const useRewordStatementMutation = (): UseMutationResult<void, Error, StatementWording> =>
  useApiMutation({
    request: requestRewordStatement,
    optimistic: [optimisticPatch(queryKeys.statementPool, withRewording)],
    changes: ['groupMatcher'],
    notice: { success: () => REWORDED_MESSAGE, ...FAILURE_NOTICE },
  });

export const useReorderStatementsMutation = (): UseMutationResult<void, Error, readonly number[]> =>
  useApiMutation({
    request: requestReorderStatements,
    optimistic: [optimisticPatch(queryKeys.statementPool, withStatementOrder)],
    changes: ['groupMatcher'],
    key: [ORDER_WRITES],
    notice: FAILURE_NOTICE,
  });

export const useDeleteStatementMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestDeleteStatement,
    optimistic: [optimisticPatch(queryKeys.statementPool, withoutStatement)],
    changes: ['groupMatcher'],
    notice: { success: () => DELETED_MESSAGE, ...FAILURE_NOTICE },
  });
