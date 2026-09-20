import type { KkScreenAction, KkScreenIndex } from '@furria/ui';
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
import { usePersonCreateDialog } from '../hooks/use-person-create-dialog';
import { usePersonsSearch } from '../hooks/use-persons-search';
import { LETTER_INDEX_LABEL, PERSONS_TITLE, toPersonsLead } from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonFormDialog } from './PersonFormDialog';
import { PersonsBody } from './PersonsBody';
import { PersonsToolbar } from './PersonsToolbar';

const SEARCH_PLACEHOLDER = 'Name, Adresse, E-Mail';

const CREATE_LABEL = 'Person anlegen';

const TOOLBAR_CHIPS = 5;

const NO_PERSONS: readonly PersonSummary[] = [];

export const PersonsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const persons = usePersonsQuery();
  const rows = persons.data?.persons ?? NO_PERSONS;
  const search = usePersonsSearch(rows);
  const dialog = usePersonCreateDialog();
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.personsManage);
  const lead = persons.data === undefined ? undefined : toPersonsLead(rows.length);

  const createAction: KkScreenAction = {
    id: 'create-person',
    label: CREATE_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: dialog.open,
  };

  const actions: readonly [KkScreenAction] | undefined = canManage ? [createAction] : undefined;

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
    persons.data === undefined ? (
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
      actions={actions}
      tools={canManage ? toolRow : undefined}
      index={index}
      title={PERSONS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={PERSONS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
        <PersonsBody search={search} onCreate={dialog.open} />
        <PersonFormDialog
          person={null}
          open={dialog.isOpen}
          onClose={dialog.close}
          onSaved={dialog.goToCreated}
        />
      </RequirePermission>
    </KkScreen>
  );
};
