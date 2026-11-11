import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextField } from '@furria/ui/KkTextField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { DAY_SCHEDULE_STEP_TEXT_MAX_LENGTH } from '../calendar-day-schedules';
import type { CalendarDayScheduleStepRowControl } from '../hooks/use-calendar-day-schedule-card';

const DAY_LABEL = 'Tag';
const TIME_LABEL = 'Uhrzeit';
const DAY_SIZE = { xs: 7, sm: 4 } as const;
const TIME_SIZE = { xs: 5, sm: 3 } as const;
const TEXT_WITH_DAY_SIZE = { xs: 12, sm: 5 } as const;
const TEXT_SIZE = { xs: 7, sm: 9 } as const;

interface CalendarDayScheduleStepRowProps {
  row: CalendarDayScheduleStepRowControl;
}

export const CalendarDayScheduleStepRow: FC<CalendarDayScheduleStepRowProps> = ({ row }) => {
  const changeText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    row.setText(event.target.value);
  };

  const dayField =
    row.dayOptions === null ? null : (
      <Grid size={DAY_SIZE}>
        <KkSelectField
          name={row.fieldNames.day}
          label={DAY_LABEL}
          value={row.dayValue}
          options={row.dayOptions}
          onChange={row.setDay}
          error={row.dayError.hasError}
          helperText={row.dayError.text}
        />
      </Grid>
    );
  const textSize = row.dayOptions === null ? TEXT_SIZE : TEXT_WITH_DAY_SIZE;
  const removeButton = row.canRemove ? (
    <KkIconButton label={row.removeLabel} icon="close" size="small" onClick={row.remove} />
  ) : null;

  return (
    <Stack component="li" direction="row" sx={{ alignItems: 'flex-start', gap: 0.5, minWidth: 0 }}>
      <Grid
        container
        role="group"
        aria-label={row.textLabel}
        spacing={1}
        sx={{ flexGrow: 1, minWidth: 0 }}
      >
        {dayField}
        <Grid size={TIME_SIZE}>
          <KkTimeField
            name={row.fieldNames.time}
            label={TIME_LABEL}
            required
            value={row.step.time}
            onChange={row.setTime}
            error={row.timeError.hasError}
            helperText={row.timeError.text}
          />
        </Grid>
        <Grid size={textSize}>
          <KkTextField
            name={row.fieldNames.text}
            label={row.textLabel}
            required
            value={row.step.text}
            maxLength={DAY_SCHEDULE_STEP_TEXT_MAX_LENGTH}
            error={row.textError.hasError}
            helperText={row.textError.text}
            onChange={changeText}
          />
        </Grid>
      </Grid>
      {removeButton}
    </Stack>
  );
};
