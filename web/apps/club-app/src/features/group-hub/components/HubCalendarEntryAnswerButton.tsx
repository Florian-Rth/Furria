import { KkButton } from '@furria/ui';
import type { FC } from 'react';
import type { AttendanceAnswerKey, AttendanceChoice } from '@/lib/calendar-copy';

interface HubCalendarEntryAnswerButtonProps {
  choice: AttendanceChoice;
  disabled: boolean;
  onSelect: (answer: AttendanceAnswerKey) => void;
}

export const HubCalendarEntryAnswerButton: FC<HubCalendarEntryAnswerButtonProps> = ({
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
