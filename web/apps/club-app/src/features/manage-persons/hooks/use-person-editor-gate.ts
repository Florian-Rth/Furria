import { usePermissions } from '@/features/session';
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

export const usePersonEditorGate = (personId: number | null): PersonEditorGateControl => {
  const person = usePersonQuery(personId);
  const { has, isUndecided } = usePermissions();

  const retry = (): void => {
    void person.refetch();
  };

  const gate = toPersonEditorGate({
    person: person.data,
    isUndecided,
    mayManage: has(PERMISSION_KEYS.personsManage),
    isForbidden: isForbiddenError(person.error),
    isMissing: personId === null || isNotFoundError(person.error),
    errorMessage: toPersonErrorMessage(person.error),
  });

  return { gate, retry };
};
