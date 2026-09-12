import type { FC } from 'react';
import { AppListAsideSkeleton, AppListSkeleton } from '@/features/session';
import { usePersonsQuery } from '../api';
import { usePersonsSearch } from '../hooks/use-persons-search';
import { MANAGE_PERSONS_SECTION_TITLE } from '../manage-persons-labels';
import { toPersonsErrorMessage } from '../manage-persons-messages';
import type { PersonSummary } from '../schemas';
import { PersonsError } from './PersonsError';
import { PersonsView } from './PersonsView';

const NO_PERSONS: readonly PersonSummary[] = [];
const LOADING_LABEL = 'Personenregister wird geladen';
const TOOLBAR_CHIPS = 5;
const ASIDE_SIZE = 4;

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

  return (
    <AppListSkeleton
      label={LOADING_LABEL}
      sectionTitle={MANAGE_PERSONS_SECTION_TITLE}
      toolbarChips={TOOLBAR_CHIPS}
      listShape="rows"
      aside={<AppListAsideSkeleton />}
      asideSize={ASIDE_SIZE}
      asideDesktopOnly
      stickyAside
      asideLeadsFocus
    />
  );
};
