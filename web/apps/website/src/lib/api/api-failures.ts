import { z } from 'zod';
import type { ApiFieldFailure } from './errors';

const FailurePayloadSchema = z.object({ errors: z.record(z.string(), z.array(z.string())) });

export type FailurePayload = z.infer<typeof FailurePayloadSchema>;

export const toCamelCaseField = (field: string): string =>
  field.length === 0 ? field : `${field.charAt(0).toLowerCase()}${field.slice(1)}`;

export const toFieldFailures = (payload: FailurePayload): ApiFieldFailure[] =>
  Object.entries(payload.errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field: toCamelCaseField(field), message })),
  );

export const readFieldFailures = async (response: Response): Promise<ApiFieldFailure[]> => {
  try {
    const parsed = FailurePayloadSchema.safeParse(await response.json());

    return parsed.success ? toFieldFailures(parsed.data) : [];
  } catch {
    return [];
  }
};
