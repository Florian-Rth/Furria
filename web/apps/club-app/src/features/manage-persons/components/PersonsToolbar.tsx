import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import { KkChipScroller } from '@furria/ui/KkChipScroller';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkFilterChips } from '@furria/ui/KkFilterChips';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { APP_FILTER_GROUP_LABEL, APP_FILTER_LABEL, APP_FILTER_OPTIONS } from '../person-app-state';

const FILTER_LABEL = 'Nach Mitgliedschaft filtern';

interface PersonsToolbarProps {
  filter: string;
  options: readonly KkFilterOption[];
  onFilterChange: (id: string) => void;
  appFilter: string;
  onAppFilterChange: (id: string) => void;
}

export const PersonsToolbar: FC<PersonsToolbarProps> = ({
  filter,
  options,
  onFilterChange,
  appFilter,
  onAppFilterChange,
}) => (
  <KkChipScroller>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
      <KkFilterChips
        label={FILTER_LABEL}
        options={options}
        value={filter}
        onChange={onFilterChange}
      />
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <KkEyebrow tone="muted">{APP_FILTER_LABEL}</KkEyebrow>
        <KkFilterChips
          label={APP_FILTER_GROUP_LABEL}
          options={APP_FILTER_OPTIONS}
          value={appFilter}
          onChange={onAppFilterChange}
        />
      </Stack>
    </Stack>
  </KkChipScroller>
);
