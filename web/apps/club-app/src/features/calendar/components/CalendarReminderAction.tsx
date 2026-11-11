import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import type { KkSx } from '@furria/ui/kk-sx';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { CalendarReminderSource } from '../calendar-reminders';
import { useCalendarReminder } from '../hooks/use-calendar-reminder';
import { useConfirmStep } from '../hooks/use-confirm-step';
import { CalendarConfirmDialog } from './CalendarConfirmDialog';

const REMIND_LABEL = 'Erinnern';

interface CalendarReminderActionProps {
  source: CalendarReminderSource;
  sx?: KkSx;
}

export const CalendarReminderAction: FC<CalendarReminderActionProps> = ({ source, sx }) => {
  const control = useCalendarReminder(source);
  const step = useConfirmStep(control.remind);

  if (control.availability === 'hidden') {
    return null;
  }

  const isWaiting = control.availability === 'waiting';
  const reminded =
    control.remindedLabel === null ? null : <KkMeta tone="muted">{control.remindedLabel}</KkMeta>;

  return (
    <Stack
      direction="row"
      sx={[{ alignItems: 'center', gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkButton
        variant="outlined"
        size="small"
        onClick={step.ask}
        loading={control.isReminding}
        disabled={isWaiting}
      >
        {REMIND_LABEL}
      </KkButton>
      {reminded}
      <CalendarConfirmDialog
        open={step.isAsked}
        copy={control.copy}
        onConfirm={step.confirm}
        onCancel={step.cancel}
      />
    </Stack>
  );
};
