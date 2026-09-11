import { KkAlert, KkMeta, KkPanel, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toNoSearchResultLine } from '../group-hub-labels';
import type { PersonSearchControl } from '../hooks/use-person-search';
import { PersonPickerRow } from './PersonPickerRow';

const SKELETON_ROWS = 3;
const TYPE_MORE_LINE = 'Tipp mindestens zwei Buchstaben.';

interface PersonPickerResultsProps {
  search: PersonSearchControl;
  onSelect: (person: PersonRef) => void;
}

export const PersonPickerResults: FC<PersonPickerResultsProps> = ({ search, onSelect }) => {
  if (search.errorMessage !== null) {
    return <KkAlert severity="error">{search.errorMessage}</KkAlert>;
  }
  if (search.isSearching) {
    return (
      <KkPanel variant="list">
        <KkSkeletonRow count={SKELETON_ROWS} />
      </KkPanel>
    );
  }
  if (search.term === null) {
    return <KkMeta>{TYPE_MORE_LINE}</KkMeta>;
  }
  if (search.isEmpty) {
    return <KkMeta italic>{toNoSearchResultLine(search.term)}</KkMeta>;
  }

  const rows = search.persons.map((person) => (
    <PersonPickerRow key={person.personId} person={person} onSelect={onSelect} />
  ));

  const capLine = search.capLine === null ? null : <KkMeta>{search.capLine}</KkMeta>;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkPanel variant="list">{rows}</KkPanel>
      {capLine}
    </Stack>
  );
};
