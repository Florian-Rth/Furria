import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import { KkFilterChips } from '@furria/ui/KkFilterChips';
import type { FC } from 'react';

const FILTER_LABEL = 'Nach Offenheit filtern';

interface GroupsToolbarProps {
  status: string;
  options: readonly KkFilterOption[];
  onStatusChange: (id: string) => void;
}

export const GroupsToolbar: FC<GroupsToolbarProps> = ({ status, options, onStatusChange }) => (
  <KkFilterChips label={FILTER_LABEL} options={options} value={status} onChange={onStatusChange} />
);
