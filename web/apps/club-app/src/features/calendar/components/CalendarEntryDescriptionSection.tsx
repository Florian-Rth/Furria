import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextArea } from '@furria/ui/KkTextArea';
import type { FC } from 'react';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import { CALENDAR_DESCRIPTION_MAX_LENGTH } from '../schemas';

const SECTION_TITLE = 'Beschreibung';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Weitere Informationen zum Termin';
const DESCRIPTION_ROWS = 4;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface CalendarEntryDescriptionSectionProps {
  control: CalendarEntryEditorControl;
}

export const CalendarEntryDescriptionSection: FC<CalendarEntryDescriptionSectionProps> = ({
  control,
}) => {
  const errorText = control.form.formState.errors.description?.message;

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkTextArea
        name="description"
        label={DESCRIPTION_LABEL}
        value={control.values.description}
        onChange={control.setDescription}
        rows={DESCRIPTION_ROWS}
        maxLength={CALENDAR_DESCRIPTION_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={DESCRIPTION_PLACEHOLDER}
        error={errorText !== undefined}
        helperText={errorText}
      />
    </KkFormSection>
  );
};
