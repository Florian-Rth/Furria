import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  isRunningOrderConflict,
  requestActArchived,
  requestActCreation,
  requestActs,
  requestActUpdate,
  requestRunningOrder,
  requestRunningOrderConfirmation,
  requestRunningOrderDeletion,
  requestRunningOrderSave,
  requestRunningOrders,
  requestSuggestion,
} from './requests';
import {
  RUNNING_ORDER_DELETED_MESSAGE,
  toActArchivedMessage,
  toActCreatedMessage,
  toActSavedMessage,
  toConfirmationMessage,
} from './running-order-copy';
import type {
  ActForm,
  ActsResponse,
  CreatedAct,
  RunningOrderBody,
  RunningOrderResponse,
  RunningOrdersResponse,
  Suggestion,
} from './schemas';

export interface ActUpdateInput {
  actId: number;
  form: ActForm;
}

export interface ActArchivedInput {
  actId: number;
  name: string;
  archived: boolean;
}

export interface ActMutations {
  create: UseMutationResult<CreatedAct, Error, ActForm>;
  update: UseMutationResult<void, Error, ActUpdateInput>;
  archive: UseMutationResult<void, Error, ActArchivedInput>;
}

export const useActsQuery = (
  sessionYear: number | null = null,
  isKnown = true,
): UseQueryResult<ActsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.acts(sessionYear),
    queryFn: isKnown
      ? () => withFreshAccessToken((accessToken) => requestActs(sessionYear, accessToken))
      : skipToken,
    placeholderData: keepPreviousData,
  });

export const useActMutations = (): ActMutations => {
  const create = useApiMutation({
    request: requestActCreation,
    changes: ['act'],
    notice: {
      success: (form: ActForm) => toActCreatedMessage(form.name),
      failure: toWriteErrorMessage,
    },
  });
  const update = useApiMutation({
    request: ({ actId, form }: ActUpdateInput, accessToken) =>
      requestActUpdate(actId, form, accessToken),
    changes: ['act'],
    notice: {
      success: ({ form }: ActUpdateInput) => toActSavedMessage(form.name),
      failure: toWriteErrorMessage,
    },
  });
  const archive = useApiMutation({
    request: ({ actId, archived }: ActArchivedInput, accessToken) =>
      requestActArchived(actId, archived, accessToken),
    changes: ['act'],
    notice: {
      success: ({ name, archived }: ActArchivedInput) => toActArchivedMessage(name, archived),
      failure: toWriteErrorMessage,
    },
  });

  return { create, update, archive };
};

export const useRunningOrderQuery = (
  eventId: number | null,
): UseQueryResult<RunningOrderResponse | null, Error> =>
  useQuery({
    queryKey: queryKeys.runningOrder(eventId ?? 0),
    queryFn:
      eventId === null
        ? skipToken
        : () => withFreshAccessToken((accessToken) => requestRunningOrder(eventId, accessToken)),
  });

const saveFailureOf = (error: Error): string | null =>
  isRunningOrderConflict(error) ? null : toWriteErrorMessage(error);

export const useSaveRunningOrderMutation = (
  eventId: number,
): UseMutationResult<RunningOrderResponse, Error, RunningOrderBody> => {
  const queryClient = useQueryClient();

  return useApiMutation({
    request: (body: RunningOrderBody, accessToken) =>
      requestRunningOrderSave(eventId, body, accessToken),
    changes: ['runningOrder'],
    key: queryKeys.runningOrder(eventId),
    notice: { failure: saveFailureOf },
    afterSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.runningOrder(eventId), saved);
    },
  });
};

export const useDeleteRunningOrderMutation = (
  eventId: number,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();

  return useApiMutation({
    request: (_input, accessToken) => requestRunningOrderDeletion(eventId, accessToken),
    changes: ['runningOrder'],
    notice: { success: () => RUNNING_ORDER_DELETED_MESSAGE, failure: toWriteErrorMessage },
    afterSuccess: () => {
      queryClient.setQueryData(queryKeys.runningOrder(eventId), null);
    },
  });
};

export const useSuggestionMutation = (
  eventId: number,
): UseMutationResult<Suggestion, Error, RunningOrderBody> =>
  useApiMutation({
    request: (body: RunningOrderBody, accessToken) => requestSuggestion(eventId, body, accessToken),
    changes: [],
    notice: { failure: toWriteErrorMessage },
  });

export const useConfirmRunningOrderMutation = (
  eventId: number,
): UseMutationResult<RunningOrderResponse, Error, boolean> => {
  const queryClient = useQueryClient();

  return useApiMutation({
    request: (confirmed: boolean, accessToken) =>
      requestRunningOrderConfirmation(eventId, confirmed, accessToken),
    changes: ['runningOrder'],
    key: queryKeys.runningOrder(eventId),
    notice: { success: toConfirmationMessage, failure: toWriteErrorMessage },
    afterSuccess: (confirmed) => {
      queryClient.setQueryData(queryKeys.runningOrder(eventId), confirmed);
    },
  });
};

export const useRunningOrdersQuery = (): UseQueryResult<RunningOrdersResponse, Error> =>
  useQuery({
    queryKey: queryKeys.runningOrders,
    queryFn: () => withFreshAccessToken(requestRunningOrders),
  });
