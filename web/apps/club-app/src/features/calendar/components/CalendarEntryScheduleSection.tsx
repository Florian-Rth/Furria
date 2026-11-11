import { KkFormSection } from '@furria/ui/KkFormSection';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import { toStartDayQuickChoices } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import { CalendarEntryEndField } from './CalendarEntryEndField';
import { CalendarEntryEndToggle } from './CalendarEntryEndToggle';
import { CalendarEntryStartField } from './CalendarEntryStartField';

const SECTION_TITLE = 'Wann & wo';
const VENUE_LABEL = 'Ort';
const END_TOGGLE_SX = { alignSelf: 'flex-start' } as const;

interface CalendarEntryScheduleSectionProps {
  control: CalendarEntryEditorControl;
  venueOptions: readonly KkSelectOption[];
}

export const CalendarEntryScheduleSection: FC<CalendarEntryScheduleSectionProps> = ({
  control,
  venueOptions,
}) => {
  const startDayQuickChoices = toStartDayQuickChoices(new Date());
  const hasEnd = control.values.endDay !== '';
  const end = hasEnd ? (
    <CalendarEntryEndField control={control} />
  ) : (
    <CalendarEntryEndToggle onAdd={control.addEnd} sx={END_TOGGLE_SX} />
  );

  return (
    <KkFormSection title={SECTION_TITLE}>
      <CalendarEntryStartField control={control} quickDays={startDayQuickChoices} />
      {end}
      <KkSelectField
        name="venueId"
        label={VENUE_LABEL}
        value={control.values.venueId}
        options={venueOptions}
        onChange={control.setVenue}
        presentation="select"
      />
    </KkFormSection>
  );
};
