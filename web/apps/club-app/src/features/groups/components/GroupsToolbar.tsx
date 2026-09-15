import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
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
