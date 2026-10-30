import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  requestActArchived,
  requestActCreation,
  requestActOpenAppearancesRemoval,
  requestActs,
  requestActUpdate,
  requestRunningOrder,
  requestRunningOrderConfirmation,
  requestRunningOrderDeletion,
  requestRunningOrderSave,
  requestRunningOrders,
} from './requests';
import {
  RUNNING_ORDER_DELETED_MESSAGE,
  toActArchivedMessage,
  toActCreatedMessage,
  toActSavedMessage,
  toActWithdrawnMessage,
  toConfirmationMessage,
  WITHDRAW_LABEL,
} from './running-order-copy';
import type {
  ActForm,
  ActsResponse,
  CreatedAct,
  RunningOrderBody,
  RunningOrderResponse,
  RunningOrdersResponse,
} from './schemas';

export interface ActUpdateInput {
  actId: number;
  form: ActForm;
}

export interface ActArchivedInput {
  actId: number;
  name: string;
  archived: boolean;
  offersWithdrawal: boolean;
}

export interface ActWithdrawalInput {
  actId: number;
  name: string;
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

const archivedNoticeOf = (
  { name, archived, offersWithdrawal }: ActArchivedInput,
  withdraw: () => void,
): KkNoticeRequest =>
  offersWithdrawal
    ? {
        tone: 'success',
        message: toActArchivedMessage(name, archived),
        actions: [{ id: 'withdraw', label: WITHDRAW_LABEL, onSelect: withdraw }],
      }
    : { tone: 'success', message: toActArchivedMessage(name, archived) };

export const useActMutations = (): ActMutations => {
  const withdrawal = useActWithdrawalMutation();
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
      success: (input: ActArchivedInput) =>
        archivedNoticeOf(input, () => {
          withdrawal.mutate({ actId: input.actId, name: input.name });
        }),
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

export const useSaveRunningOrderMutation = (
  eventId: number,
): UseMutationResult<RunningOrderResponse, Error, RunningOrderBody> => {
  const queryClient = useQueryClient();

  return useApiMutation({
    request: (body: RunningOrderBody, accessToken) =>
      requestRunningOrderSave(eventId, body, accessToken),
    changes: ['runningOrder'],
    key: queryKeys.runningOrder(eventId),
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

export const useActWithdrawalMutation = (): UseMutationResult<void, Error, ActWithdrawalInput> =>
  useApiMutation({
    request: ({ actId }: ActWithdrawalInput, accessToken) =>
      requestActOpenAppearancesRemoval(actId, accessToken),
    changes: ['runningOrder'],
    notice: {
      success: ({ name }: ActWithdrawalInput) => toActWithdrawnMessage(name),
      failure: toWriteErrorMessage,
    },
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

export const useRunningOrdersQuery = (
  enabled = true,
): UseQueryResult<RunningOrdersResponse, Error> =>
  useQuery({
    queryKey: queryKeys.runningOrders,
    queryFn: enabled ? () => withFreshAccessToken(requestRunningOrders) : skipToken,
  });
