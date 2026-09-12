import { KkButton, KkIcon } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePersonFormDialog } from '../hooks/use-person-form-dialog';
import { usePersonsSearch } from '../hooks/use-persons-search';
import type { PersonSummary } from '../schemas';
import { PersonFormDialog } from './PersonFormDialog';
import { PersonsAside } from './PersonsAside';
import { PersonsColdEmpty } from './PersonsColdEmpty';
import { PersonsCreateFab } from './PersonsCreateFab';
import { PersonsEmpty } from './PersonsEmpty';
import { PersonsIntro } from './PersonsIntro';
import { PersonsList } from './PersonsList';
import { PersonsToolbar } from './PersonsToolbar';

const CREATE_LABEL = 'Person anlegen';

interface PersonsViewProps {
  persons: readonly PersonSummary[];
}

export const PersonsView: FC<PersonsViewProps> = ({ persons }) => {
  const search = usePersonsSearch(persons);
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
    <KkButton
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={dialog.open}
    >
      {CREATE_LABEL}
    </KkButton>
  );

  return (
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      <PersonsIntro total={search.total} action={createButton} />
      <Grid container spacing={{ xs: 3, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: 8 }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 2.5, minWidth: 0 }}>
            <PersonsToolbar
              query={search.query}
              onQueryChange={search.setQuery}
              state={search.state}
              options={search.filterOptions}
              onStateChange={search.selectState}
            />
            {list}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 4 }} sx={{ display: { xs: 'none', desktop: 'block' } }}>
          <PersonsAside
            letters={search.letters}
            letter={search.letter}
            onLetterSelect={search.jumpTo}
            totals={search.totals}
          />
        </Grid>
      </Grid>
      <PersonsCreateFab label={CREATE_LABEL} onClick={dialog.open} />
      {formDialog}
    </Stack>
  );
};
