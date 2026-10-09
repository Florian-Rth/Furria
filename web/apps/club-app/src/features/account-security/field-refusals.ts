import { refusalOf } from '@furria/api-client';
import type { FormFailures, FormFieldFailure } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';

const FIELD_REFUSAL_STATUSES: readonly number[] = [400, 409];

export const toFieldRefusals = <TName extends string>(
  error: Error,
  names: readonly TName[],
): FormFailures<TName> => {
  const refusal = refusalOf(error);

  if (refusal === null || !FIELD_REFUSAL_STATUSES.includes(refusal.status)) {
    return { fields: [], footer: toWriteErrorMessage(error) };
  }

  const fields: FormFieldFailure<TName>[] = [];
  const unmatched: string[] = [];

  for (const failure of refusal.fields) {
    const name = names.find((known) => known === failure.field);

    if (name === undefined) {
      unmatched.push(failure.message);
    } else {
      fields.push({ name, message: failure.message });
    }
  }

  return { fields, footer: unmatched[0] ?? null };
};

export const refusesField = <TName extends string>(
  failures: FormFailures<TName>,
  name: TName,
): boolean => failures.fields.some((failure) => failure.name === name);
