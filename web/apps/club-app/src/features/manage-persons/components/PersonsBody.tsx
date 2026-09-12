import type { FC } from 'react';
import { usePersonsQuery } from '../api';
import { usePersonsSearch } from '../hooks/use-persons-search';
import { toPersonsErrorMessage } from '../manage-persons-messages';
import type { PersonSummary } from '../schemas';
import { PersonsError } from './PersonsError';
import { PersonsSkeleton } from './PersonsSkeleton';
import { PersonsView } from './PersonsView';

const NO_PERSONS: readonly PersonSummary[] = [];

export const PersonsBody: FC = () => {
  const persons = usePersonsQuery();
  const rows = persons.data?.persons ?? NO_PERSONS;
  const search = usePersonsSearch(rows);
  const errorMessage = toPersonsErrorMessage(persons.error);

  const reload = (): void => {
    void persons.refetch();
  };

  if (persons.data !== undefined) {
    return <PersonsView persons={rows} search={search} />;
  }
  if (errorMessage !== null) {
    return <PersonsError message={errorMessage} onRetry={reload} />;
  }

  return <PersonsSkeleton search={search} />;
};
