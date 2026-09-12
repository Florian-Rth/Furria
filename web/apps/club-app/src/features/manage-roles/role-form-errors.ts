import { RequestFailedError } from '@/lib/api/api-error';

const FIELD_ERROR_STATUS = 400;

export type RoleFormField = 'name' | 'description';

export interface RoleFieldError {
  field: RoleFormField;
  message: string;
}

const ROLE_FORM_FIELDS: readonly RoleFormField[] = ['name', 'description'];

export const toFieldName = (raw: string): string => {
  const [base] = raw.split('[');

  if (base === undefined) {
    return raw;
  }

  const [first] = base;

  return first === undefined ? base : `${first.toLowerCase()}${base.slice(1)}`;
};

const isRoleFormField = (value: string): value is RoleFormField =>
  ROLE_FORM_FIELDS.some((field) => field === value);

interface NamedFailure {
  field: string;
  message: string;
}

const isRoleFieldError = (failure: NamedFailure): failure is RoleFieldError =>
  isRoleFormField(failure.field);

export const toRoleFieldErrors = (error: Error | null): RoleFieldError[] => {
  if (!(error instanceof RequestFailedError) || error.status !== FIELD_ERROR_STATUS) {
    return [];
  }

  return error.failures
    .map((failure) => ({ field: toFieldName(failure.field), message: failure.message }))
    .filter(isRoleFieldError);
};
