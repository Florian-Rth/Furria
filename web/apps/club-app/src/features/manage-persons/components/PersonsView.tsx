import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ManagePageLayout } from '@/features/session';
import { usePersonFormDialog } from '../hooks/use-person-form-dialog';
import type { PersonsSearch } from '../hooks/use-persons-search';
import { MANAGE_PERSONS_SECTION_TITLE, toPersonsLead } from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonFormDialog } from './PersonFormDialog';
import { PersonsAside } from './PersonsAside';
import { PersonsColdEmpty } from './PersonsColdEmpty';
import { PersonsCreateFab } from './PersonsCreateFab';
import { PersonsEmpty } from './PersonsEmpty';
import { PersonsList } from './PersonsList';
import { PersonsToolbar } from './PersonsToolbar';

const CREATE_LABEL = 'Person anlegen';
const ASIDE_SIZE = 4;

interface PersonsViewProps {
  persons: readonly PersonSummary[];
  search: PersonsSearch;
}

export const PersonsView: FC<PersonsViewProps> = ({ persons, search }) => {
  const dialog = usePersonFormDialog();

  const formDialog = (
    <PersonFormDialog
      person={null}
      open={dialog.isOpen}
      onClose={dialog.close}
      onSaved={dialog.close}
    />
  );

  if (persons.length === 0) {
    return (
      <Stack sx={{ gap: 3, minWidth: 0 }}>
        <PersonsColdEmpty onCreate={dialog.open} />
        {formDialog}
      </Stack>
    );
  }

  const list =
    search.visibleCount === 0 ? (
      <PersonsEmpty query={search.query} />
    ) : (
      <PersonsList sections={search.sections} />
    );

  const createButton = (
    <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={dialog.open}>
      {CREATE_LABEL}
    </KkButton>
  );

  const toolbar = (
    <PersonsToolbar
      query={search.query}
      onQueryChange={search.setQuery}
      state={search.state}
      options={search.filterOptions}
      onStateChange={search.selectState}
      letters={search.letters}
      letter={search.letter}
      onLetterSelect={search.jumpTo}
    />
  );

  const aside = (
    <PersonsAside
      letters={search.letters}
      letter={search.letter}
      onLetterSelect={search.jumpTo}
      totals={search.totals}
    />
  );

  return (
    <>
      <ManagePageLayout
        lead={toPersonsLead(search.total)}
        sectionTitle={MANAGE_PERSONS_SECTION_TITLE}
        createAction={createButton}
        toolbar={toolbar}
        list={list}
        aside={aside}
        asideSize={ASIDE_SIZE}
        asideDesktopOnly
        stickyColumn="aside"
      />
      <PersonsCreateFab label={CREATE_LABEL} onClick={dialog.open} />
      {formDialog}
    </>
  );
};
