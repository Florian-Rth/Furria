import type { KkSelectOption } from '@furria/ui';
import { KkFormSection, KkMultiSelectField, KkSelectField, KkSwitchRow } from '@furria/ui';
import type { FC } from 'react';
import { CALENDAR_VISIBILITY_OPTIONS } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';

const SECTION_TITLE = 'Wer & wie';
const OWNER_LABEL = 'Eigentümer';
const OWNER_HINT = 'Nur der Eigentümer kann den Termin bearbeiten.';
const PARTICIPANTS_LABEL = 'Mitwirkende Gruppen';
const PARTICIPANTS_HINT = 'Der Termin erscheint zusätzlich bei diesen Gruppen.';
const VISIBILITY_LABEL = 'Sichtbarkeit';
const VISIBILITY_HINT = 'Legt fest, wer den Termin im Kalender sieht.';
const RESPONSE_LABEL = 'Nach Zu-/Absage fragen';
const RESPONSE_DESCRIPTION = 'Alle, die den Termin sehen, können zu- oder absagen.';

interface CalendarEntryAudienceSectionProps {
  control: CalendarEntryEditorControl;
  ownerOptions: readonly KkSelectOption[];
  participantOptions: readonly KkSelectOption[];
  participantsEmptyLabel: string;
}

export const CalendarEntryAudienceSection: FC<CalendarEntryAudienceSectionProps> = ({
  control,
  ownerOptions,
  participantOptions,
  participantsEmptyLabel,
}) => {
  const participantsErrorText = control.form.formState.errors.participatingGroupIds?.message;

  const ownerField =
    ownerOptions.length < 2 ? null : (
      <KkSelectField
        name="ownerId"
        label={OWNER_LABEL}
        required
        value={control.values.ownerId}
        options={ownerOptions}
        onChange={control.setOwner}
        hint={OWNER_HINT}
      />
    );

  return (
    <KkFormSection title={SECTION_TITLE}>
      {ownerField}
      <KkMultiSelectField
        name="participatingGroupIds"
        label={PARTICIPANTS_LABEL}
        values={control.values.participatingGroupIds}
        options={participantOptions}
        onToggle={control.toggleParticipatingGroup}
        emptyLabel={participantsEmptyLabel}
        hint={PARTICIPANTS_HINT}
        error={participantsErrorText !== undefined}
        helperText={participantsErrorText}
      />
      <KkSelectField
        name="visibility"
        label={VISIBILITY_LABEL}
        required
        value={control.values.visibility}
        options={CALENDAR_VISIBILITY_OPTIONS}
        onChange={control.setVisibility}
        presentation="choices"
        hint={VISIBILITY_HINT}
      />
      <KkSwitchRow
        label={RESPONSE_LABEL}
        checked={control.values.asksForResponse}
        onChange={control.setAsksForResponse}
        description={RESPONSE_DESCRIPTION}
      />
    </KkFormSection>
  );
};
