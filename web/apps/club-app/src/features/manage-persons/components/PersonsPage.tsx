import type { KkScreenIndex } from '@furria/ui';
import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import {
  AREA_HANDOVERS,
  MANAGE_ORIGIN,
  RequireAnyPermission,
  usePermissions,
  useScreenSearch,
} from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonsQuery } from '../api';
import { usePersonsAccess } from '../hooks/use-persons-access';
import { usePersonsSearch } from '../hooks/use-persons-search';
import { LETTER_INDEX_LABEL, PERSONS_LEAD, PERSONS_TITLE } from '../manage-persons-labels';
import { PERSON_READ_KEYS } from '../person-read-keys';
import type { PersonSummary } from '../schemas';
import { PersonsBody } from './PersonsBody';
import { PersonsToolbar } from './PersonsToolbar';

const SEARCH_PLACEHOLDER = 'Name, Adresse, E-Mail';

const TOOLBAR_CHIPS = 5;

const NO_PERSONS: readonly PersonSummary[] = [];

export const PersonsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const access = usePersonsAccess();
  const listed = usePersonsQuery(access.filter, false);
  const archived = usePersonsQuery(access.filter, true);
  const search = usePersonsSearch(
    listed.data?.persons ?? NO_PERSONS,
    archived.data?.persons ?? NO_PERSONS,
  );
  const { has, isUndecided } = usePermissions();
  const canRead = PERSON_READ_KEYS.some((key) => has(key));
  const canCreate = has(PERMISSION_KEYS.personsManage);
  const showsTools = isUndecided || canRead;
  const isArchiveSettled = archived.data !== undefined || archived.error !== null;
  const isToolbarPending = listed.data === undefined || !isArchiveSettled || isUndecided;

  const index: KkScreenIndex | undefined =
    !canRead || search.letters.length === 0
      ? undefined
      : {
          label: LETTER_INDEX_LABEL,
          letters: search.letters,
          current: search.letter,
          onSelect: search.jumpTo,
        };

  const toolRow = isToolbarPending ? (
    <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />
  ) : (
    <PersonsToolbar
      filter={search.filter}
      options={search.filterOptions}
      onFilterChange={search.selectFilter}
    />
  );

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      tools={showsTools ? toolRow : undefined}
      index={index}
      title={PERSONS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={PERSONS_TITLE} lead={PERSONS_LEAD} />}
      handover={AREA_HANDOVERS.manage}
    >
      <RequireAnyPermission permissionKeys={PERSON_READ_KEYS}>
        <PersonsBody search={search} canCreate={canCreate} />
      </RequireAnyPermission>
    </KkScreen>
  );
};
