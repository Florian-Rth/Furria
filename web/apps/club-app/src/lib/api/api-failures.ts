import { refusalOf } from '@furria/api-client';
import { toWriteErrorMessage } from '@/lib/write-error';

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
  const refusal = refusalOf(error);

  if (refusal === null) {
    return { fields: [], footer: null };
  }
  if (refusal.status !== FIELD_FAILURE_STATUS) {
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
