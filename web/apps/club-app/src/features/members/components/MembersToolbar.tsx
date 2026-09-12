import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips, KkSearchField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const SEARCH_NAME = 'member-search';
const SEARCH_LABEL = 'Suche';
const SEARCH_PLACEHOLDER = 'Name, Gruppe oder Rolle';
const CLEAR_LABEL = 'Suche leeren';
const FILTER_LABEL = 'Nach Mitgliedschaft filtern';

interface MembersToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  state: string;
  options: readonly KkFilterOption[];
  onStateChange: (id: string) => void;
}

export const MembersToolbar: FC<MembersToolbarProps> = ({
  query,
  onQueryChange,
  state,
  options,
  onStateChange,
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
  </Stack>
);
