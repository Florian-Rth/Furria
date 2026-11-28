import { KkButton } from '@furria/ui/KkButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MARKING_TITLE } from '../calendar-marking-copy';
import type { CalendarMarkingControl } from '../hooks/use-calendar-marking';
import { CalendarMarkingSheet } from './CalendarMarkingSheet';

interface CalendarMarkingActionProps {
  marking: CalendarMarkingControl;
}

export const CalendarMarkingAction: FC<CalendarMarkingActionProps> = ({ marking }) => {
  if (!marking.isAvailable) {
    return null;
  }

  return (
    <Stack direction="row" sx={{ minWidth: 0 }}>
      <KkButton variant="outlined" size="small" onClick={marking.open}>
        {MARKING_TITLE}
      </KkButton>
      <CalendarMarkingSheet marking={marking} />
    </Stack>
  );
};
