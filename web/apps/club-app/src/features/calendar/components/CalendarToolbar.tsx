import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
import type { FC } from 'react';
import { SCOPE_FILTER_LABEL } from '../calendar-labels';

interface CalendarToolbarProps {
  scopeId: string;
  options: readonly KkFilterOption[];
  onScopeChange: (scopeId: string) => void;
}

export const CalendarToolbar: FC<CalendarToolbarProps> = ({ scopeId, options, onScopeChange }) => (
  <KkFilterChips
    label={SCOPE_FILTER_LABEL}
    options={options}
    value={scopeId}
    onChange={onScopeChange}
  />
);
