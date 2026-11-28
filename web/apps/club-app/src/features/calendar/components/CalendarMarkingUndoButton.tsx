import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import { MARKING_UNDO } from '../calendar-marking-copy';
import type { CalendarMarkingUndo } from '../hooks/use-calendar-marking';

interface CalendarMarkingUndoButtonProps {
  undo: CalendarMarkingUndo;
}

export const CalendarMarkingUndoButton: FC<CalendarMarkingUndoButtonProps> = ({ undo }) => (
  <KkButton variant="text" size="small" ariaLabel={undo.label} onClick={undo.run}>
    {MARKING_UNDO}
  </KkButton>
);
