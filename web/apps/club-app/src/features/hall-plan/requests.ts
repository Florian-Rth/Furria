import { apiStatusOf } from '@furria/api-client';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
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
import {
  CreatedHallSchema,
  CreatedTableTypeSchema,
  HallDetailsSchema,
  HallsResponseSchema,
  SavedVersionSchema,
  SeatingResponseSchema,
  TablePlanResponseSchema,
  TablePlansResponseSchema,
} from './schemas';

const CONFLICT_STATUS = 409;

export class PlanVersionConflictError extends Error {
  constructor() {
    super('The plan changed meanwhile.');
    this.name = 'PlanVersionConflictError';
  }
}

export const isPlanVersionConflict = (error: Error | null): boolean =>
  error instanceof PlanVersionConflictError;

const withVersionConflict = async <T>(call: () => Promise<T>): Promise<T> => {
  try {
    return await call();
  } catch (error) {
    if (error instanceof Error && apiStatusOf(error) === CONFLICT_STATUS) {
      throw new PlanVersionConflictError();
    }
    throw error;
  }
};

const tablePlanPathOf = (eventId: number): string => `/api/events/${eventId}/table-plan`;

export const requestSeating = (accessToken: string): Promise<SeatingResponse> =>
  apiFetch('/api/seating', { schema: SeatingResponseSchema, accessToken });

export const requestSeatingStandardSave = (
  standard: SeatingStandard,
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/seating/standard', {
    method: 'PUT',
    body: standard,
    schema: NoContentSchema,
    accessToken,
  });

export const requestTableTypeCreation = (
  form: TableTypeForm,
  accessToken: string,
): Promise<CreatedTableType> =>
  apiFetch('/api/seating/table-types', {
    method: 'POST',
    body: form,
    schema: CreatedTableTypeSchema,
    accessToken,
  });

export const requestTableTypeUpdate = (
  tableTypeId: number,
  form: TableTypeForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/seating/table-types/${tableTypeId}`, {
    method: 'PUT',
    body: form,
    schema: NoContentSchema,
    accessToken,
  });

export const requestTableTypeDeletion = (tableTypeId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/seating/table-types/${tableTypeId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestHalls = (accessToken: string): Promise<HallsResponse> =>
  apiFetch('/api/halls', { schema: HallsResponseSchema, accessToken });

export const requestHall = (hallId: number, accessToken: string): Promise<HallDetails> =>
  apiFetch(`/api/halls/${hallId}`, { schema: HallDetailsSchema, accessToken });

export const requestHallCreation = (
  creation: HallCreation,
  accessToken: string,
): Promise<CreatedHall> =>
  apiFetch('/api/halls', {
    method: 'POST',
    body: creation,
    schema: CreatedHallSchema,
    accessToken,
  });

export const requestHallSave = (
  hallId: number,
  save: HallSave,
  accessToken: string,
): Promise<SavedVersion> =>
  withVersionConflict(() =>
    apiFetch(`/api/halls/${hallId}`, {
      method: 'PUT',
      body: save,
      schema: SavedVersionSchema,
      accessToken,
    }),
  );

export const requestHallDeletion = (hallId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/halls/${hallId}`, { method: 'DELETE', schema: NoContentSchema, accessToken });

export const requestTablePlans = (accessToken: string): Promise<TablePlansResponse> =>
  apiFetch('/api/table-plans', { schema: TablePlansResponseSchema, accessToken });

export const requestTablePlan = async (
  eventId: number,
  accessToken: string,
): Promise<TablePlanResponse | null> => {
  try {
    return await apiFetch(tablePlanPathOf(eventId), {
      schema: TablePlanResponseSchema,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error && isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
};

export const requestTablePlanCreation = (
  eventId: number,
  creation: TablePlanCreation,
  accessToken: string,
): Promise<void> =>
  apiFetch(tablePlanPathOf(eventId), {
    method: 'POST',
    body: creation,
    schema: NoContentSchema,
    accessToken,
  });

export const requestTablePlanSave = (
  eventId: number,
  save: TablePlanSave,
  accessToken: string,
): Promise<SavedVersion> =>
  withVersionConflict(() =>
    apiFetch(tablePlanPathOf(eventId), {
      method: 'PUT',
      body: save,
      schema: SavedVersionSchema,
      accessToken,
    }),
  );

export const requestTablePlanNeed = (
  eventId: number,
  needed: boolean,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/events/${eventId}/table-plan-need`, {
    method: 'PUT',
    body: { needed },
    schema: NoContentSchema,
    accessToken,
  });
