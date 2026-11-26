import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { ENTRY_HELP_SPOTS } from '../calendar-entry-help-copy';
import { CALENDAR_KIND_OPTIONS } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';

const SECTION_TITLE = 'Termin';
const TITLE_LABEL = 'Titel';
const KIND_LABEL = 'Art';

interface CalendarEntryBasicsSectionProps {
  control: CalendarEntryEditorControl;
}

export const CalendarEntryBasicsSection: FC<CalendarEntryBasicsSectionProps> = ({ control }) => {
  const titleField = control.form.register('title');
  const errors = control.form.formState.errors;
  const titleErrorText = errors.title?.message;

  return (
    <KkFormSection title={SECTION_TITLE} landing={ENTRY_HELP_SPOTS.basics}>
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
    </KkFormSection>
  );
};
