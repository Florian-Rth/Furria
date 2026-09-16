import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
import type { FC } from 'react';

const FILTER_LABEL = 'Nach Status filtern';

interface RolesToolbarProps {
  status: string;
  options: readonly KkFilterOption[];
  onStatusChange: (id: string) => void;
}

export const RolesToolbar: FC<RolesToolbarProps> = ({ status, options, onStatusChange }) => (
  <KkFilterChips label={FILTER_LABEL} options={options} value={status} onChange={onStatusChange} />
);
