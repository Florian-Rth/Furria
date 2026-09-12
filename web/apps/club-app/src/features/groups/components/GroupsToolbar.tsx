import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips, KkSearchField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const SEARCH_NAME = 'groups-search';
const SEARCH_LABEL = 'Suche';
const SEARCH_PLACEHOLDER = 'Name der Gruppe';
const CLEAR_LABEL = 'Suche leeren';
const FILTER_LABEL = 'Nach Offenheit filtern';

interface GroupsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  options: readonly KkFilterOption[];
  onStatusChange: (id: string) => void;
}

export const GroupsToolbar: FC<GroupsToolbarProps> = ({
  query,
  onQueryChange,
  status,
  options,
  onStatusChange,
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
    <KkFilterChips
      label={FILTER_LABEL}
      options={options}
      value={status}
      onChange={onStatusChange}
    />
  </Stack>
);
