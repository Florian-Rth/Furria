import type { KkFilterOption, KkLetterIndexEntry } from '@furria/ui';
import { KkFilterChips, KkLetterIndex, KkSearchField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const SEARCH_NAME = 'person-register-search';
const SEARCH_LABEL = 'Suche';
const SEARCH_PLACEHOLDER = 'Name, Adresse, E-Mail';
const CLEAR_LABEL = 'Suche leeren';
const FILTER_LABEL = 'Nach Mitgliedschaft filtern';
const LETTER_INDEX_LABEL = 'Zu einem Buchstaben springen';

interface PersonsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  state: string;
  options: readonly KkFilterOption[];
  onStateChange: (id: string) => void;
  letters: readonly KkLetterIndexEntry[];
  letter: string | undefined;
  onLetterSelect: (letter: string) => void;
}

export const PersonsToolbar: FC<PersonsToolbarProps> = ({
  query,
  onQueryChange,
  state,
  options,
  onStateChange,
  letters,
  letter,
  onLetterSelect,
}) => (
  <Stack sx={{ gap: 1.75, minWidth: 0 }}>
    <KkSearchField
      name={SEARCH_NAME}
      label={SEARCH_LABEL}
      clearLabel={CLEAR_LABEL}
      value={query}
      onChange={onQueryChange}
      placeholder={SEARCH_PLACEHOLDER}
    />
    <KkFilterChips label={FILTER_LABEL} options={options} value={state} onChange={onStateChange} />
    <Stack sx={{ display: { xs: 'flex', desktop: 'none' }, minWidth: 0 }}>
      <KkLetterIndex
        variant="strip"
        label={LETTER_INDEX_LABEL}
        letters={letters}
        current={letter}
        onSelect={onLetterSelect}
      />
    </Stack>
  </Stack>
);
