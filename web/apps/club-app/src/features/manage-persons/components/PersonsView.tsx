import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PersonsAccess } from '../hooks/use-persons-access';
import type { PersonsSearch } from '../hooks/use-persons-search';
import {
  ADD_PERSON_ACTION_LABEL,
  ADD_PERSON_LABEL,
  PERSON_DIRECTORY_TITLE,
  PERSONS_STATS_NOTE,
} from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonsAccessNote } from './PersonsAccessNote';
import { PersonsColdEmpty } from './PersonsColdEmpty';
import { PersonsEmpty } from './PersonsEmpty';
import { PersonsList } from './PersonsList';
import { PersonsStats } from './PersonsStats';

const VIEW_GAP = 3.5;
const CREATE_ROUTE = '/manage/persons/new';

interface PersonsViewProps {
  persons: readonly PersonSummary[];
  search: PersonsSearch;
  access: PersonsAccess;
  canCreate: boolean;
}

const CREATE_ACTION: KkPanelAction = {
  label: ADD_PERSON_LABEL,
  icon: 'add',
  ariaLabel: ADD_PERSON_ACTION_LABEL,
  component: Link,
  to: CREATE_ROUTE,
};

export const PersonsView: FC<PersonsViewProps> = ({ persons, search, access, canCreate }) => {
  const action = canCreate ? CREATE_ACTION : undefined;

  if (persons.length === 0 && access.filter === null) {
    return (
      <KkPanelSection title={PERSON_DIRECTORY_TITLE} action={action}>
        <KkPanel variant="block">
          <PersonsColdEmpty />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const list =
    search.visibleCount === 0 ? (
      <PersonsEmpty query={search.query} state={search.state} access={access.filter} />
    ) : (
      <PersonsList sections={search.sections} />
    );

  const accessNote =
    access.filter === null ? null : (
      <PersonsAccessNote filter={access.filter} onClear={access.clear} />
    );

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      <KkPanelSection title={PERSON_DIRECTORY_TITLE} action={action}>
        {accessNote}
        {list}
      </KkPanelSection>
      <PersonsStats totals={search.totals} note={PERSONS_STATS_NOTE} />
    </Stack>
  );
};
