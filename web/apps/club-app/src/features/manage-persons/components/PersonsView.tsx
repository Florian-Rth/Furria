import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PersonsSearch } from '../hooks/use-persons-search';
import {
  ADD_PERSON_ACTION_LABEL,
  ADD_PERSON_LABEL,
  PERSON_DIRECTORY_TITLE,
  PERSONS_STATS_NOTE,
} from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonsColdEmpty } from './PersonsColdEmpty';
import { PersonsEmpty } from './PersonsEmpty';
import { PersonsList } from './PersonsList';
import { PersonsStats } from './PersonsStats';

const VIEW_GAP = 3.5;
const CREATE_ROUTE = '/manage/persons/new';

interface PersonsViewProps {
  persons: readonly PersonSummary[];
  search: PersonsSearch;
}

export const PersonsView: FC<PersonsViewProps> = ({ persons, search }) => {
  const action: KkPanelAction = {
    label: ADD_PERSON_LABEL,
    icon: 'add',
    ariaLabel: ADD_PERSON_ACTION_LABEL,
    component: Link,
    to: CREATE_ROUTE,
  };

  if (persons.length === 0) {
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
      <PersonsEmpty query={search.query} state={search.state} />
    ) : (
      <PersonsList sections={search.sections} />
    );

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      <KkPanelSection title={PERSON_DIRECTORY_TITLE} action={action}>
        {list}
      </KkPanelSection>
      <PersonsStats totals={search.totals} note={PERSONS_STATS_NOTE} />
    </Stack>
  );
};
