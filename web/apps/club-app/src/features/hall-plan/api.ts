import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  HALL_DELETED_MESSAGE,
  SEATING_STANDARD_SAVED_MESSAGE,
  TABLE_TYPE_REMOVED_MESSAGE,
  toTableTypeSavedMessage,
} from './hall-plan-copy';
import {
  isPlanVersionConflict,
  requestHall,
  requestHallCreation,
  requestHallDeletion,
  requestHallSave,
  requestHalls,
  requestSeating,
  requestSeatingStandardSave,
  requestTablePlan,
  requestTablePlanCreation,
  requestTablePlanNeed,
  requestTablePlanSave,
  requestTablePlans,
  requestTableTypeCreation,
  requestTableTypeDeletion,
  requestTableTypeUpdate,
} from './requests';
import type {
  CreatedHall,
  CreatedTableType,
  HallCreation,
  HallDetails,
  HallSave,
  HallsResponse,
  SavedVersion,
  SeatingResponse,
  SeatingStandard,
  TablePlanCreation,
  TablePlanResponse,
  TablePlanSave,
  TablePlansResponse,
  TableTypeForm,
} from './schemas';

export interface TableTypeUpdateInput {
  tableTypeId: number;
  form: TableTypeForm;
}

export interface TableTypeMutations {
  create: UseMutationResult<CreatedTableType, Error, TableTypeForm>;
  update: UseMutationResult<void, Error, TableTypeUpdateInput>;
  remove: UseMutationResult<void, Error, number>;
}

const autosaveFailure = (error: Error): string | null =>
  isPlanVersionConflict(error) ? null : toWriteErrorMessage(error);

export const useSeatingQuery = (enabled = true): UseQueryResult<SeatingResponse, Error> =>
  useQuery({
    queryKey: queryKeys.seating,
    queryFn: enabled ? () => withFreshAccessToken(requestSeating) : skipToken,
  });

export const useSaveSeatingStandardMutation = (): UseMutationResult<void, Error, SeatingStandard> =>
  useApiMutation({
    request: requestSeatingStandardSave,
    changes: ['seating'],
    notice: { success: () => SEATING_STANDARD_SAVED_MESSAGE, failure: toWriteErrorMessage },
  });

export const useTableTypeMutations = (): TableTypeMutations => {
  const create = useApiMutation({
    request: requestTableTypeCreation,
    changes: ['seating'],
    notice: {
      success: (form: TableTypeForm) => toTableTypeSavedMessage(form.name),
      failure: toWriteErrorMessage,
    },
  });
  const update = useApiMutation({
    request: ({ tableTypeId, form }: TableTypeUpdateInput, accessToken) =>
      requestTableTypeUpdate(tableTypeId, form, accessToken),
    changes: ['seating'],
    notice: {
      success: ({ form }: TableTypeUpdateInput) => toTableTypeSavedMessage(form.name),
      failure: toWriteErrorMessage,
    },
  });
  const remove = useApiMutation({
    request: requestTableTypeDeletion,
    changes: ['seating'],
    notice: { success: () => TABLE_TYPE_REMOVED_MESSAGE, failure: toWriteErrorMessage },
  });

  return { create, update, remove };
};

export const useHallsQuery = (enabled = true): UseQueryResult<HallsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.halls,
    queryFn: enabled ? () => withFreshAccessToken(requestHalls) : skipToken,
  });

export const useHallQuery = (hallId: number | null): UseQueryResult<HallDetails, Error> =>
  useQuery({
    queryKey: queryKeys.hall(hallId ?? 0),
    queryFn:
      hallId === null
        ? skipToken
        : () => withFreshAccessToken((accessToken) => requestHall(hallId, accessToken)),
  });

export const useCreateHallMutation = (): UseMutationResult<CreatedHall, Error, HallCreation> =>
  useApiMutation({
    request: requestHallCreation,
    changes: ['hall'],
    notice: { failure: toWriteErrorMessage },
  });

export const useSaveHallMutation = (
  hallId: number,
): UseMutationResult<SavedVersion, Error, HallSave> =>
  useApiMutation({
    request: (save: HallSave, accessToken) => requestHallSave(hallId, save, accessToken),
    changes: ['hall'],
    key: queryKeys.hall(hallId),
    notice: { failure: autosaveFailure },
  });

export const useDeleteHallMutation = (): UseMutationResult<void, Error, number> =>
  useApiMutation({
    request: requestHallDeletion,
    changes: ['hall'],
    notice: { success: () => HALL_DELETED_MESSAGE, failure: toWriteErrorMessage },
  });

export const useTablePlansQuery = (enabled = true): UseQueryResult<TablePlansResponse, Error> =>
  useQuery({
    queryKey: queryKeys.tablePlans,
    queryFn: enabled ? () => withFreshAccessToken(requestTablePlans) : skipToken,
  });

export const useTablePlanQuery = (
  eventId: number | null,
): UseQueryResult<TablePlanResponse | null, Error> =>
  useQuery({
    queryKey: queryKeys.tablePlan(eventId ?? 0),
    queryFn:
      eventId === null
        ? skipToken
        : () => withFreshAccessToken((accessToken) => requestTablePlan(eventId, accessToken)),
  });

export const useCreateTablePlanMutation = (
  eventId: number,
): UseMutationResult<void, Error, TablePlanCreation> => {
  const queryClient = useQueryClient();

  return useApiMutation({
    request: (creation: TablePlanCreation, accessToken) =>
      requestTablePlanCreation(eventId, creation, accessToken),
    changes: ['tablePlan'],
    notice: { failure: toWriteErrorMessage },
    afterSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tablePlan(eventId) });
    },
  });
};

export const useSaveTablePlanMutation = (
  eventId: number,
): UseMutationResult<SavedVersion, Error, TablePlanSave> =>
  useApiMutation({
    request: (save: TablePlanSave, accessToken) => requestTablePlanSave(eventId, save, accessToken),
    changes: ['tablePlan'],
    key: queryKeys.tablePlan(eventId),
    notice: { failure: autosaveFailure },
  });

export const useTablePlanNeedMutation = (
  eventId: number,
): UseMutationResult<void, Error, boolean> =>
  useApiMutation({
    request: (needed: boolean, accessToken) => requestTablePlanNeed(eventId, needed, accessToken),
    changes: ['event'],
    notice: { failure: toWriteErrorMessage },
  });
