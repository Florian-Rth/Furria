import { KkFormSection } from '@furria/ui/KkFormSection';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkSessionField } from '@furria/ui/KkSessionField';
import type { FC } from 'react';
import { currentSessionYear } from '@/lib/club';
import type { AlbumFormControl } from '../hooks/use-album-form';
import type { AlbumFormEntries } from '../hooks/use-album-form-entries';

const SECTION_TITLE = 'Zuordnung';
const LINK_LABEL = 'Gehört zu';
const LINK_HINT =
  'Ein Termin bringt Datum und Session mit. Auf der Website erscheinen nur Alben mit Session.';
const LINK_OPTIONS: readonly KkSelectOption[] = [
  { value: 'entry', label: 'Einem Termin' },
  { value: 'session', label: 'Einer Session' },
  { value: 'none', label: 'Nichts davon' },
];
const ENTRY_LABEL = 'Termin';
const ENTRY_PLACEHOLDER = 'Termin wählen';
const ENTRY_HINT = 'Termine der letzten zwölf Monate.';
const ENTRY_LOADING_HINT = 'Termine werden geladen …';
const ENTRY_FAILED_HINT = 'Die Termine ließen sich nicht laden. Wähle stattdessen die Session.';
const SESSION_LABEL = 'Session';

interface AlbumFormLinkSectionProps {
  control: AlbumFormControl;
  entries: AlbumFormEntries;
}

const entryHintOf = (entries: AlbumFormEntries): string => {
  if (entries.hasFailed) {
    return ENTRY_FAILED_HINT;
  }
  return entries.isLoading ? ENTRY_LOADING_HINT : ENTRY_HINT;
};

export const AlbumFormLinkSection: FC<AlbumFormLinkSectionProps> = ({ control, entries }) => {
  const errors = control.form.formState.errors;
  const entryErrorText = errors.calendarEntryId?.message;
  const sessionErrorText = errors.sessionStartYear?.message;
  const entryHint = entryHintOf(entries);
  const sessionYear = currentSessionYear();
  const entryField = (
    <KkSelectField
      name="calendarEntryId"
      label={ENTRY_LABEL}
      required
      value={control.values.calendarEntryId}
      options={entries.options}
      onChange={control.setEntry}
      presentation="select"
      placeholder={ENTRY_PLACEHOLDER}
      hint={entryHint}
      error={entryErrorText !== undefined}
      helperText={entryErrorText}
    />
  );
  const sessionField = (
    <KkSessionField
      name="sessionStartYear"
      label={SESSION_LABEL}
      required
      value={control.values.sessionStartYear}
      onChange={control.setSession}
      currentSessionYear={sessionYear}
      error={sessionErrorText !== undefined}
      helperText={sessionErrorText}
    />
  );
  const linkedField = { entry: entryField, session: sessionField, none: null }[control.values.link];

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkSelectField
        name="link"
        label={LINK_LABEL}
        value={control.values.link}
        options={LINK_OPTIONS}
        onChange={control.setLink}
        presentation="choices"
        hint={LINK_HINT}
      />
      {linkedField}
    </KkFormSection>
  );
};
