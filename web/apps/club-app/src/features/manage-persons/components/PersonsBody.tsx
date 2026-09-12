import type { FC } from 'react';
import { usePersonsQuery } from '../api';
import { toPersonsErrorMessage } from '../manage-persons-messages';
import { PersonsError } from './PersonsError';
import { PersonsSkeleton } from './PersonsSkeleton';
import { PersonsView } from './PersonsView';

export const PersonsBody: FC = () => {
  const persons = usePersonsQuery();
  const errorMessage = toPersonsErrorMessage(persons.error);

  const reload = (): void => {
    void persons.refetch();
  };

  if (persons.data !== undefined) {
    return <PersonsView persons={persons.data.persons} />;
  }
  if (errorMessage !== null) {
    return <PersonsError message={errorMessage} onRetry={reload} />;
  }

  return <PersonsSkeleton />;
};
