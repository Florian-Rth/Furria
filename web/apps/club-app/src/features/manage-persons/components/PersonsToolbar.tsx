import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
import type { FC } from 'react';

const FILTER_LABEL = 'Nach Mitgliedschaft filtern';

interface PersonsToolbarProps {
  filter: string;
  options: readonly KkFilterOption[];
  onFilterChange: (id: string) => void;
}

export const PersonsToolbar: FC<PersonsToolbarProps> = ({ filter, options, onFilterChange }) => (
  <KkFilterChips label={FILTER_LABEL} options={options} value={filter} onChange={onFilterChange} />
);
