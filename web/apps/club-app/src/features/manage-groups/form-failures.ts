import { RequestFailedError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';

const FIELD_FAILURE_STATUS = 400;

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
