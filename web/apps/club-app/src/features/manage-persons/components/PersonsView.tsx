import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonsSearch } from '../hooks/use-persons-search';
import { PERSONS_STATS_NOTE } from '../manage-persons-labels';
import type { PersonSummary } from '../schemas';
import { PersonsColdEmpty } from './PersonsColdEmpty';
import { PersonsEmpty } from './PersonsEmpty';
import { PersonsList } from './PersonsList';
import { PersonsStats } from './PersonsStats';

const VIEW_GAP = 3.5;

interface PersonsViewProps {
  persons: readonly PersonSummary[];
  search: PersonsSearch;
  onCreate: () => void;
}

export const PersonsView: FC<PersonsViewProps> = ({ persons, search, onCreate }) => {
  if (persons.length === 0) {
    return <PersonsColdEmpty onCreate={onCreate} />;
  }

  const list =
    search.visibleCount === 0 ? (
      <PersonsEmpty query={search.query} state={search.state} />
    ) : (
      <PersonsList sections={search.sections} />
    );

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      {list}
      <PersonsStats totals={search.totals} note={PERSONS_STATS_NOTE} />
    </Stack>
  );
};
