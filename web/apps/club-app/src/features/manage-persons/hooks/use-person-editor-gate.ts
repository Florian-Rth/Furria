import { usePermissions } from '@/features/session';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { usePersonQuery } from '../api';
import { toPersonErrorMessage } from '../manage-persons-messages';
import type { PersonEditorGate } from '../person-editor-gate';
import { toPersonEditorGate } from '../person-editor-gate';
import type { PersonDetails } from '../schemas';

export interface PersonEditorGateControl {
  gate: PersonEditorGate<PersonDetails>;
  retry: () => void;
}

export const usePersonEditorGate = (
  personId: number | null,
  permissionKey: PermissionKey = PERMISSION_KEYS.personsManage,
): PersonEditorGateControl => {
  const person = usePersonQuery(personId);
  const { has, isUndecided } = usePermissions();

  const retry = (): void => {
    void person.refetch();
  };

  const gate = toPersonEditorGate({
    person: person.data,
    isUndecided,
    mayManage: has(permissionKey),
    isForbidden: isForbiddenError(person.error),
    isMissing: personId === null || isNotFoundError(person.error),
    errorMessage: toPersonErrorMessage(person.error),
  });

  return { gate, retry };
};
