import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { usePersonsQuery } from '../api';
import type { PersonsSearch } from '../hooks/use-persons-search';
import { toPersonsErrorMessage } from '../manage-persons-messages';
import { PersonsError } from './PersonsError';
import { PersonsView } from './PersonsView';

const LOADING_LABEL = 'Personenregister wird geladen';

interface PersonsBodyProps {
  search: PersonsSearch;
}

export const PersonsBody: FC<PersonsBodyProps> = ({ search }) => {
  const persons = usePersonsQuery();
  const errorMessage = toPersonsErrorMessage(persons.error);

  const reload = (): void => {
    void persons.refetch();
  };

  if (persons.data !== undefined) {
    return <PersonsView persons={persons.data.persons} search={search} />;
  }
  if (errorMessage !== null) {
    return <PersonsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
