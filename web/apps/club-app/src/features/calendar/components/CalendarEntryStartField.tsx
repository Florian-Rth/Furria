import type { KkDateQuickChoice } from '@furria/ui/KkMomentField';
import { KkMomentField } from '@furria/ui/KkMomentField';
import type { FC } from 'react';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';

const START_LABEL = 'Beginn';
const START_QUICK_TIMES = ['11:11', '18:11', '19:11', '20:11'] as const;

interface CalendarEntryStartFieldProps {
  control: CalendarEntryEditorControl;
  quickDays: readonly KkDateQuickChoice[];
}

export const CalendarEntryStartField: FC<CalendarEntryStartFieldProps> = ({
  control,
  quickDays,
}) => {
  const errors = control.form.formState.errors;
  const errorText = errors.startDay?.message ?? errors.startTime?.message;

  return (
    <KkMomentField>
      <KkMomentField.Head>
        <KkMomentField.Label label={START_LABEL} required />
      </KkMomentField.Head>
      <KkMomentField.Picker
        label={START_LABEL}
        day={control.values.startDay}
        time={control.values.startTime}
        onDayChange={control.setStartDay}
        onTimeChange={control.setStartTime}
        quickDays={quickDays}
        quickTimes={START_QUICK_TIMES}
        error={errorText}
      />
    </KkMomentField>
  );
};
