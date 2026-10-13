import type { KkSelectOption } from '@furria/ui';
import { KkDateField, KkFormPair, KkFormSection, KkSelectField, KkTimeField } from '@furria/ui';
import type { FC } from 'react';
import type { EventEditorControl } from '../hooks/use-event-editor';

const SECTION_TITLE = 'Wann & wo';
const DAY_LABEL = 'Tag';
const DOORS_LABEL = 'Einlass';
const DOORS_EMPTY_LABEL = 'Ohne';
const START_LABEL = 'Beginn';
const VENUE_LABEL = 'Ort';
const VENUE_HINT = 'Die Website zeigt die Anschrift des Ortes.';
const QUICK_TIMES = ['14:11', '20:11', '21:11'] as const;

interface EventScheduleSectionProps {
  control: EventEditorControl;
  venueOptions: readonly KkSelectOption[];
}

export const EventScheduleSection: FC<EventScheduleSectionProps> = ({ control, venueOptions }) => {
  const errors = control.form.formState.errors;
  const startDayErrorText = errors.startDay?.message;
  const startTimeErrorText = errors.startTime?.message;
  const doorsOpenAtErrorText = errors.doorsOpenAt?.message;
  const venueIdErrorText = errors.venueId?.message;

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkDateField
        name="startDay"
        label={DAY_LABEL}
        required
        value={control.values.startDay}
        onChange={control.setStartDay}
        error={startDayErrorText !== undefined}
        helperText={startDayErrorText}
      />
      <KkFormPair
        phone="side"
        start={
          <KkTimeField
            name="doorsOpenAt"
            label={DOORS_LABEL}
            value={control.values.doorsOpenAt}
            onChange={control.setDoorsOpenAt}
            quickTimes={QUICK_TIMES}
            allowEmpty
            emptyLabel={DOORS_EMPTY_LABEL}
            error={doorsOpenAtErrorText !== undefined}
            helperText={doorsOpenAtErrorText}
          />
        }
        end={
          <KkTimeField
            name="startTime"
            label={START_LABEL}
            required
            value={control.values.startTime}
            onChange={control.setStartTime}
            quickTimes={QUICK_TIMES}
            error={startTimeErrorText !== undefined}
            helperText={startTimeErrorText}
          />
        }
      />
      <KkSelectField
        name="venueId"
        label={VENUE_LABEL}
        required
        value={control.values.venueId}
        options={venueOptions}
        onChange={control.setVenue}
        presentation="select"
        hint={VENUE_HINT}
        error={venueIdErrorText !== undefined}
        helperText={venueIdErrorText}
      />
    </KkFormSection>
  );
};
