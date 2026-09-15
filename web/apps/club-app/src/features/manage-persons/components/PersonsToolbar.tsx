import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
import type { FC } from 'react';

const FILTER_LABEL = 'Nach Mitgliedschaft filtern';

interface PersonsToolbarProps {
  state: string;
  options: readonly KkFilterOption[];
  onStateChange: (id: string) => void;
}

export const PersonsToolbar: FC<PersonsToolbarProps> = ({ state, options, onStateChange }) => (
  <KkFilterChips label={FILTER_LABEL} options={options} value={state} onChange={onStateChange} />
);
