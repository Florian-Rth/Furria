import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMultiSelectField } from '@furria/ui/KkMultiSelectField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { toAudienceOptions } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';

const SECTION_TITLE = 'Wer & wie';
const OWNER_LABEL = 'Eigentümer';
const PARTICIPANTS_LABEL = 'Mitwirkende Gruppen';
const AUDIENCE_LABEL = 'Für wen';
const RESPONSE_LABEL = 'Nach Zu-/Absage fragen';
const PARTICIPANTS_RELOAD_LABEL = 'Gruppen neu laden';

interface CalendarEntryAudienceSectionProps {
  control: CalendarEntryEditorControl;
  ownerOptions: readonly KkSelectOption[];
  participantOptions: readonly KkSelectOption[];
  participantsEmptyLabel: string;
  participantsReload: CalendarEntryReload | null;
}

export const CalendarEntryAudienceSection: FC<CalendarEntryAudienceSectionProps> = ({
  control,
  ownerOptions,
  participantOptions,
  participantsEmptyLabel,
  participantsReload,
}) => {
  const participantsErrorText = control.form.formState.errors.participatingGroupIds?.message;
  const audienceOptions = toAudienceOptions(control.values, control.heldAudience);

  const ownerField =
    ownerOptions.length < 2 ? null : (
      <KkSelectField
        name="ownerId"
        label={OWNER_LABEL}
        required
        value={control.values.ownerId}
        options={ownerOptions}
        onChange={control.setOwner}
      />
    );

  const participantsReloadButton =
    participantsReload === null ? null : (
      <KkButton
        variant="outlined"
        size="small"
        loading={participantsReload.isRetrying}
        onClick={participantsReload.retry}
        sx={{ alignSelf: 'flex-start' }}
      >
        {PARTICIPANTS_RELOAD_LABEL}
      </KkButton>
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
        error={participantsErrorText !== undefined}
        helperText={participantsErrorText}
      />
      {participantsReloadButton}
      <KkSelectField
        name="audience"
        label={AUDIENCE_LABEL}
        required
        value={control.values.audience}
        options={audienceOptions}
        onChange={control.setAudience}
        presentation="choices"
      />
      <KkSwitchRow
        label={RESPONSE_LABEL}
        checked={control.values.asksForResponse}
        onChange={control.setAsksForResponse}
      />
    </KkFormSection>
  );
};
