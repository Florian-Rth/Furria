import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';

const ADD_END_LABEL = 'Ende angeben';

interface CalendarEntryEndToggleProps {
  onAdd: () => void;
  sx?: KkSx;
}

export const CalendarEntryEndToggle: FC<CalendarEntryEndToggleProps> = ({ onAdd, sx }) => {
  const addIcon = <KkIcon name="add" size="small" />;

  return (
    <KkButton variant="text" startIcon={addIcon} onClick={onAdd} sx={sx}>
      {ADD_END_LABEL}
    </KkButton>
  );
};
