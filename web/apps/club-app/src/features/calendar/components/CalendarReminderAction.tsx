import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { REMIND_LABEL } from '../calendar-labels';
import type { CalendarReminderSource } from '../calendar-reminders';
import { useCalendarReminder } from '../hooks/use-calendar-reminder';
import { useConfirmStep } from '../hooks/use-confirm-step';
import { CalendarConfirmDialog } from './CalendarConfirmDialog';

const NOTHING = (): void => undefined;

interface CalendarReminderActionProps {
  source: CalendarReminderSource | null;
}

export const CalendarReminderAction: FC<CalendarReminderActionProps> = ({ source }) => {
  const control = useCalendarReminder(source);
  const step = useConfirmStep(control?.remind ?? NOTHING);

  if (control === null || control.availability === 'hidden') {
    return null;
  }

  const describedBy = control.metaLabel === null ? undefined : control.metaId;
  const meta =
    control.metaLabel === null ? null : (
      <Box id={control.metaId}>
        <KkMeta tone="muted">{control.metaLabel}</KkMeta>
      </Box>
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <KkButton
        variant="outlined"
        size="small"
        onClick={step.ask}
        loading={control.isReminding}
        disabled={control.isDisabled}
        ariaDescribedBy={describedBy}
      >
        {REMIND_LABEL}
      </KkButton>
      {meta}
      <CalendarConfirmDialog
        open={step.isAsked}
        copy={control.copy}
        onConfirm={step.confirm}
        onCancel={step.cancel}
      />
    </Stack>
  );
};
