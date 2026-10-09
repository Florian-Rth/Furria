import { refusalOf } from '@furria/api-client';

const FIELD_ERROR_STATUS = 400;

export type RoleFormField = 'name' | 'description';

export interface RoleFieldError {
  field: RoleFormField;
  message: string;
}

const ROLE_FORM_FIELDS: readonly RoleFormField[] = ['name', 'description'];

const withoutIndex = (field: string): string => field.split('[')[0] ?? field;

const isRoleFormField = (value: string): value is RoleFormField =>
  ROLE_FORM_FIELDS.some((field) => field === value);

interface NamedFailure {
  field: string;
  message: string;
}

const isRoleFieldError = (failure: NamedFailure): failure is RoleFieldError =>
  isRoleFormField(failure.field);

export const toRoleFieldErrors = (error: Error | null): RoleFieldError[] => {
  const refusal = refusalOf(error);

  if (refusal === null || refusal.status !== FIELD_ERROR_STATUS) {
    return [];
  }

  return refusal.fields
    .map((failure) => ({ field: withoutIndex(failure.field), message: failure.message }))
    .filter(isRoleFieldError);
};
