import { KkButton } from '@furria/ui';
import type { FC } from 'react';
import type { AttendanceChoice } from '../calendar-labels';
import type { AttendanceAnswer } from '../schemas';

interface CalendarAttendanceButtonProps {
  choice: AttendanceChoice;
  disabled: boolean;
  onSelect: (answer: AttendanceAnswer) => void;
}

export const CalendarAttendanceButton: FC<CalendarAttendanceButtonProps> = ({
  choice,
  disabled,
  onSelect,
}) => {
  const select = (): void => {
    onSelect(choice.answer);
  };

  const variant = choice.selected ? 'contained' : 'outlined';

  return (
    <KkButton size="small" variant={variant} disabled={disabled} onClick={select}>
      {choice.label}
    </KkButton>
  );
};
