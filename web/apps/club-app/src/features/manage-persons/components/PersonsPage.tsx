import type { KkScreenIndex } from '@furria/ui';
import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import {
  MANAGE_ORIGIN,
  RequirePermission,
  usePermissions,
  useScreenSearch,
} from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonsQuery } from '../api';
import { usePersonsSearch } from '../hooks/use-persons-search';
import { LETTER_INDEX_LABEL, PERSONS_LEAD, PERSONS_TITLE } from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonsBody } from './PersonsBody';
import { PersonsToolbar } from './PersonsToolbar';

const SEARCH_PLACEHOLDER = 'Name, Adresse, E-Mail';

const TOOLBAR_CHIPS = 5;

const NO_PERSONS: readonly PersonSummary[] = [];

export const PersonsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const persons = usePersonsQuery();
  const rows = persons.data?.persons ?? NO_PERSONS;
  const search = usePersonsSearch(rows);
  const { has, isUndecided } = usePermissions();
  const canManage = has(PERMISSION_KEYS.personsManage);
  const showsTools = isUndecided || canManage;

  const index: KkScreenIndex | undefined =
    !canManage || search.letters.length === 0
      ? undefined
      : {
          label: LETTER_INDEX_LABEL,
          letters: search.letters,
          current: search.letter,
          onSelect: search.jumpTo,
        };

  const toolRow =
    persons.data === undefined || isUndecided ? (
      <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />
    ) : (
      <PersonsToolbar
        state={search.state}
        options={search.filterOptions}
        onStateChange={search.selectState}
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
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
        <PersonsBody search={search} />
      </RequirePermission>
    </KkScreen>
  );
};
