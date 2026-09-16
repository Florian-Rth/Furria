import { z } from 'zod';
import type { ApiFieldFailure, RequestFailedStatus } from './api-error';

const FailurePayloadSchema = z.object({ errors: z.record(z.string(), z.array(z.string())) });
export type FailurePayload = z.infer<typeof FailurePayloadSchema>;

const REQUEST_FAILED_STATUSES: readonly number[] = [400, 409, 422];

export const isRequestFailedStatus = (status: number): status is RequestFailedStatus =>
  REQUEST_FAILED_STATUSES.includes(status);

export const readFailurePayload = async (response: Response): Promise<FailurePayload | null> => {
  try {
    const parsed = FailurePayloadSchema.safeParse(await response.json());

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const toFieldFailures = (payload: FailurePayload): ApiFieldFailure[] =>
  Object.entries(payload.errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message })),
  );

export const toCamelCaseField = (field: string): string =>
  field.length === 0 ? field : `${field.charAt(0).toLowerCase()}${field.slice(1)}`;
