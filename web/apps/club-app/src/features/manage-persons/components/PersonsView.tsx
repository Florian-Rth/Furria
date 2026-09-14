import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppListLayout } from '@/features/session';
import { usePersonCreateDialog } from '../hooks/use-person-create-dialog';
import type { PersonsSearch } from '../hooks/use-persons-search';
import { MANAGE_PERSONS_SECTION_TITLE, PERSONS_STATS_NOTE } from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonFormDialog } from './PersonFormDialog';
import { PersonsAside } from './PersonsAside';
import { PersonsColdEmpty } from './PersonsColdEmpty';
import { PersonsCreateFab } from './PersonsCreateFab';
import { PersonsEmpty } from './PersonsEmpty';
import { PersonsLetterRail } from './PersonsLetterRail';
import { PersonsList } from './PersonsList';
import { PersonsToolbar } from './PersonsToolbar';

const CREATE_LABEL = 'Person anlegen';
const ASIDE_SIZE = 4;

interface PersonsViewProps {
  persons: readonly PersonSummary[];
  search: PersonsSearch;
}

export const PersonsView: FC<PersonsViewProps> = ({ persons, search }) => {
  const dialog = usePersonCreateDialog();

  const formDialog = (
    <PersonFormDialog
      person={null}
      open={dialog.isOpen}
      onClose={dialog.close}
      onSaved={dialog.goToCreated}
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
      <PersonsEmpty query={search.query} state={search.state} />
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
    />
  );

  const letterRail = (
    <PersonsLetterRail
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
      note={PERSONS_STATS_NOTE}
    />
  );

  return (
    <>
      <AppListLayout
        asideNote={PERSONS_STATS_NOTE}
        sectionTitle={MANAGE_PERSONS_SECTION_TITLE}
        createAction={createButton}
        toolbar={toolbar}
        letterRail={letterRail}
        list={list}
        aside={aside}
        asideSize={ASIDE_SIZE}
        asideDesktopOnly
        stickyAside
        asideLeadsFocus
      />
      <PersonsCreateFab label={CREATE_LABEL} onClick={dialog.open} />
      {formDialog}
    </>
  );
};
