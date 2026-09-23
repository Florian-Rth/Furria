import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { isNotFoundError } from '@/lib/query-error';
import { usePersonQuery } from '../api';
import { toPersonErrorMessage } from '../manage-persons-messages';
import { PersonEditError } from './PersonEditError';
import { PersonEditNotFound } from './PersonEditNotFound';
import { PersonEditSkeleton } from './PersonEditSkeleton';
import { PersonEditView } from './PersonEditView';

interface PersonEditBodyProps {
  personId: number | null;
}

export const PersonEditBody: FC<PersonEditBodyProps> = ({ personId }) => {
  const person = usePersonQuery(personId);
  const { isUndecided } = usePermissions();
  const errorMessage = toPersonErrorMessage(person.error);
  const missing = personId === null || isNotFoundError(person.error);

  const reload = (): void => {
    void person.refetch();
  };

  if (person.data !== undefined && !isUndecided) {
    return <PersonEditView person={person.data} />;
  }
  if (missing) {
    return <PersonEditNotFound />;
  }
  if (errorMessage !== null) {
    return <PersonEditError message={errorMessage} onRetry={reload} />;
  }

  return <PersonEditSkeleton />;
};
