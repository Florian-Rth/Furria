import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import { KkFilterChips } from '@furria/ui/KkFilterChips';
import type { FC } from 'react';

const FILTER_LABEL = 'Die Arbeit filtern';

interface ManagedGroupsToolbarProps {
  filter: string;
  options: readonly KkFilterOption[];
  onFilterChange: (id: string) => void;
}

export const ManagedGroupsToolbar: FC<ManagedGroupsToolbarProps> = ({
  filter,
  options,
  onFilterChange,
}) => (
  <KkFilterChips label={FILTER_LABEL} options={options} value={filter} onChange={onFilterChange} />
);
