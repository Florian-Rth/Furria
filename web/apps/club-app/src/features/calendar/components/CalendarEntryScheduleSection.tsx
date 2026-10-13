import type { KkSelectOption } from '@furria/ui';
import { KkDateField, KkFormPair, KkFormSection, KkSelectField, KkTimeField } from '@furria/ui';
import type { FC } from 'react';
import { toStartDayQuickChoices } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';

const SECTION_TITLE = 'Wann & wo';
const START_DAY_LABEL = 'Tag';
const START_TIME_LABEL = 'Beginn';
const END_DAY_LABEL = 'Letzter Tag';
const END_DAY_EMPTY_LABEL = 'Offenes Ende';
const END_TIME_LABEL = 'Ende';
const VENUE_LABEL = 'Ort';
const VENUE_HINT = 'Nur mit Ort werden Doppelbelegungen erkannt.';
const START_QUICK_TIMES = ['11:11', '18:11', '19:11', '20:11'] as const;
const END_QUICK_TIMES = ['20:11', '21:11', '22:11', '23:11'] as const;

interface CalendarEntryScheduleSectionProps {
  control: CalendarEntryEditorControl;
  venueOptions: readonly KkSelectOption[];
}

export const CalendarEntryScheduleSection: FC<CalendarEntryScheduleSectionProps> = ({
  control,
  venueOptions,
}) => {
  const errors = control.form.formState.errors;
  const startDayErrorText = errors.startDay?.message;
  const startTimeErrorText = errors.startTime?.message;
  const endTimeErrorText = errors.endTime?.message;
  const startDayQuickChoices = toStartDayQuickChoices(new Date());
  const hasOpenEnd = control.values.endDay === '';

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name="startDay"
            label={START_DAY_LABEL}
            required
            value={control.values.startDay}
            onChange={control.setStartDay}
            quickChoices={startDayQuickChoices}
            error={startDayErrorText !== undefined}
            helperText={startDayErrorText}
          />
        }
        end={
          <KkTimeField
            name="startTime"
            label={START_TIME_LABEL}
            required
            value={control.values.startTime}
            onChange={control.setStartTime}
            quickTimes={START_QUICK_TIMES}
            error={startTimeErrorText !== undefined}
            helperText={startTimeErrorText}
          />
        }
      />
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name="endDay"
            label={END_DAY_LABEL}
            value={control.values.endDay}
            onChange={control.setEndDay}
            allowEmpty
            emptyLabel={END_DAY_EMPTY_LABEL}
          />
        }
        end={
          <KkTimeField
            name="endTime"
            label={END_TIME_LABEL}
            value={control.values.endTime}
            onChange={control.setEndTime}
            quickTimes={END_QUICK_TIMES}
            disabled={hasOpenEnd}
            error={endTimeErrorText !== undefined}
            helperText={endTimeErrorText}
          />
        }
      />
      <KkSelectField
        name="venueId"
        label={VENUE_LABEL}
        value={control.values.venueId}
        options={venueOptions}
        onChange={control.setVenue}
        presentation="select"
        hint={VENUE_HINT}
      />
    </KkFormSection>
  );
};
