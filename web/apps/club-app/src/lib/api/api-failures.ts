import { z } from 'zod';
import type { ApiFieldFailure, RequestFailedStatus } from './api-error';
import { RequestFailedError } from './api-error';

const FailurePayloadSchema = z.object({ errors: z.record(z.string(), z.array(z.string())) });
export type FailurePayload = z.infer<typeof FailurePayloadSchema>;

const REQUEST_FAILED_STATUSES: readonly number[] = [400, 409, 422];
const FIELD_FAILURE_STATUS = 400;

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

export interface FormFieldFailure<TName extends string> {
  name: TName;
  message: string;
}

export interface FormFailures<TName extends string> {
  fields: readonly FormFieldFailure<TName>[];
  footer: string | null;
}

export const toFormFailures = <TName extends string>(
  error: Error | null,
  names: readonly TName[],
): FormFailures<TName> => {
  if (!(error instanceof RequestFailedError)) {
    return { fields: [], footer: null };
  }
  if (error.status !== FIELD_FAILURE_STATUS) {
    return { fields: [], footer: error.firstMessage };
  }

  const fields: FormFieldFailure<TName>[] = [];
  const unmatched: string[] = [];

  for (const failure of error.failures) {
    const candidate = toCamelCaseField(failure.field);
    const name = names.find((known) => known === candidate);

    if (name === undefined) {
      unmatched.push(failure.message);
    } else {
      fields.push({ name, message: failure.message });
    }
  }

  return { fields, footer: unmatched[0] ?? null };
};
