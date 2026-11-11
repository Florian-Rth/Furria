import { KkMomentField } from '@furria/ui/KkMomentField';
import type { FC } from 'react';
import { toEndSpanLabel } from '../calendar-authoring';
import { toEndDayQuickChoices } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';

const END_LABEL = 'Ende';
const REMOVE_LABEL = 'Entfernen';
const END_QUICK_TIMES = ['20:11', '21:11', '22:11', '23:11'] as const;

interface CalendarEntryEndFieldProps {
  control: CalendarEntryEditorControl;
}

export const CalendarEntryEndField: FC<CalendarEntryEndFieldProps> = ({ control }) => {
  const { startDay, startTime, endDay, endTime } = control.values;
  const spanLabel = toEndSpanLabel(
    { day: startDay, time: startTime },
    { day: endDay, time: endTime },
  );
  const quickDays = toEndDayQuickChoices(startDay);
  const errorText = control.form.formState.errors.endTime?.message;

  return (
    <KkMomentField>
      <KkMomentField.Head>
        <KkMomentField.Label label={END_LABEL} note={spanLabel} />
        <KkMomentField.Action label={REMOVE_LABEL} onSelect={control.removeEnd} />
      </KkMomentField.Head>
      <KkMomentField.Picker
        label={END_LABEL}
        day={endDay}
        time={endTime}
        onDayChange={control.setEndDay}
        onTimeChange={control.setEndTime}
        quickDays={quickDays}
        quickTimes={END_QUICK_TIMES}
        error={errorText}
      />
    </KkMomentField>
  );
};
