import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { usePersonsQuery } from '../api';
import { usePersonsAccess } from '../hooks/use-persons-access';
import type { PersonsSearch } from '../hooks/use-persons-search';
import { toPersonsErrorMessage } from '../manage-persons-messages';
import { PersonsError } from './PersonsError';
import { PersonsView } from './PersonsView';

const LOADING_LABEL = 'Personenregister wird geladen';

interface PersonsBodyProps {
  search: PersonsSearch;
  canCreate: boolean;
  canInvite: boolean;
}

export const PersonsBody: FC<PersonsBodyProps> = ({ search, canCreate, canInvite }) => {
  const access = usePersonsAccess();
  const persons = usePersonsQuery(access.filter, search.isArchivedView);
  const errorMessage = toPersonsErrorMessage(persons.error);

  const reload = (): void => {
    void persons.refetch();
  };

  if (persons.data !== undefined) {
    return (
      <PersonsView search={search} access={access} canCreate={canCreate} canInvite={canInvite} />
    );
  }
  if (errorMessage !== null) {
    return <PersonsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
