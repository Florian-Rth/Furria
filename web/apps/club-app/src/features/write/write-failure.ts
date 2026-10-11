import { RequestFailedError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';

const INDEX_START = '[';

export interface WriteFieldFailure<TName extends string> {
  name: TName;
  message: string;
}

export interface WriteFailure<TName extends string> {
  fields: readonly WriteFieldFailure<TName>[];
  footer: string | null;
}

const toFormFieldName = (field: string): string => {
  const indexStart = field.indexOf(INDEX_START);

  return toCamelCaseField(indexStart === -1 ? field : field.slice(0, indexStart));
};

export const toWriteFailure = <TName extends string>(
  error: Error,
  names: readonly TName[],
): WriteFailure<TName> => {
  if (!(error instanceof RequestFailedError)) {
    return { fields: [], footer: toWriteErrorMessage(error) };
  }

  const fields: WriteFieldFailure<TName>[] = [];
  const unmatched: string[] = [];

  for (const failure of error.failures) {
    const candidate = toFormFieldName(failure.field);
    const name = names.find((known) => known === candidate);

    if (name === undefined) {
      unmatched.push(failure.message);
    } else {
      fields.push({ name, message: failure.message });
    }
  }

  return { fields, footer: unmatched[0] ?? (fields.length === 0 ? error.firstMessage : null) };
};
