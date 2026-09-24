import { KkButton, KkMeta, KkPanel, KkPersonRow, KkSearchField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import { usePersonSearch } from '../hooks/use-person-search';
import { PersonPickerResults } from './PersonPickerResults';

const SEARCH_NAME = 'person-search';
const SEARCH_LABEL = 'Person suchen';
const SEARCH_PLACEHOLDER = 'Vorname oder Nachname';
const CLEAR_LABEL = 'Suche leeren';
const CHANGE_LABEL = 'Andere Person wählen';

interface PersonPickerProps {
  selected: PersonRef | null;
  onSelect: (person: PersonRef) => void;
  onClear: () => void;
  note?: string;
}

export const PersonPicker: FC<PersonPickerProps> = ({ selected, onSelect, onClear, note }) => {
  const search = usePersonSearch();
  const noteLine = note === undefined ? null : <KkMeta>{note}</KkMeta>;

  if (selected !== null) {
    const name = `${selected.firstName} ${selected.lastName}`;

    return (
      <Stack sx={{ gap: 1, minWidth: 0, alignItems: 'flex-start' }}>
        <KkPanel variant="list" sx={{ alignSelf: 'stretch' }}>
          <KkPersonRow initials={toInitials(selected.firstName, selected.lastName)} name={name} />
        </KkPanel>
        <KkButton variant="text" size="small" onClick={onClear}>
          {CHANGE_LABEL}
        </KkButton>
        {noteLine}
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      <KkSearchField
        name={SEARCH_NAME}
        label={SEARCH_LABEL}
        clearLabel={CLEAR_LABEL}
        value={search.query}
        onChange={search.setQuery}
        placeholder={SEARCH_PLACEHOLDER}
        required
      />
      <PersonPickerResults search={search} onSelect={onSelect} />
      {noteLine}
    </Stack>
  );
};
