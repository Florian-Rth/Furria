import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextArea } from '@furria/ui/KkTextArea';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { CALENDAR_KIND_OPTIONS } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import { CALENDAR_DESCRIPTION_MAX_LENGTH } from '../schemas';

const SECTION_TITLE = 'Termin';
const TITLE_LABEL = 'Titel';
const KIND_LABEL = 'Art';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Weitere Informationen zum Termin';
const DESCRIPTION_HINT = 'Steht im Kalender unter dem Termin.';
const DESCRIPTION_ROWS = 4;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface CalendarEntryBasicsSectionProps {
  control: CalendarEntryEditorControl;
}

export const CalendarEntryBasicsSection: FC<CalendarEntryBasicsSectionProps> = ({ control }) => {
  const titleField = control.form.register('title');
  const errors = control.form.formState.errors;
  const titleErrorText = errors.title?.message;
  const descriptionErrorText = errors.description?.message;

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkTextField
        name={titleField.name}
        label={TITLE_LABEL}
        required
        error={titleErrorText !== undefined}
        helperText={titleErrorText}
        onChange={titleField.onChange}
        onBlur={titleField.onBlur}
        inputRef={titleField.ref}
      />
      <KkSelectField
        name="kind"
        label={KIND_LABEL}
        required
        value={control.values.kind}
        options={CALENDAR_KIND_OPTIONS}
        onChange={control.setKind}
        presentation="choices"
      />
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
        hint={DESCRIPTION_HINT}
        error={descriptionErrorText !== undefined}
        helperText={descriptionErrorText}
      />
    </KkFormSection>
  );
};
