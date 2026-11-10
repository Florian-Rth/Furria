import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMultiSelectField } from '@furria/ui/KkMultiSelectField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toAudienceGroupOptions, toParticipantsEmptyLabel } from '../calendar-authoring';
import { CALENDAR_AUDIENCE_OPTIONS } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { AudienceGroup, AudiencePerson } from '../schemas';
import { CalendarGroupsReloadButton } from './CalendarGroupsReloadButton';
import { CalendarPeoplePicker } from './CalendarPeoplePicker';

const SECTION_TITLE = 'Für wen';
const AUDIENCE_LABEL = 'Für wen';
const GROUPS_LABEL = 'Gruppen';
const OWNER_LABEL = 'Eigentümer';

interface CalendarEntryAudienceSectionProps {
  control: CalendarEntryEditorControl;
  ownerOptions: readonly KkSelectOption[];
  heldGroups: readonly AudienceGroup[];
  heldPeople: readonly AudiencePerson[];
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload | null;
}

export const CalendarEntryAudienceSection: FC<CalendarEntryAudienceSectionProps> = ({
  control,
  ownerOptions,
  heldGroups,
  heldPeople,
  clubGroups,
  clubGroupsReload,
}) => {
  const errors = control.form.formState.errors;
  const groupsErrorText = errors.audienceGroupIds?.message;
  const peopleErrorText = errors.audiencePersonIds?.message;
  const audience = control.values.audience;
  const groupOptions = toAudienceGroupOptions(clubGroups, heldGroups);
  const groupsEmptyLabel = toParticipantsEmptyLabel(clubGroups);

  const reloadButton =
    clubGroupsReload === null ? null : <CalendarGroupsReloadButton reload={clubGroupsReload} />;

  const groupsPicker =
    audience === 'groups' ? (
      <>
        <KkMultiSelectField
          name="audienceGroupIds"
          label={GROUPS_LABEL}
          required
          values={control.values.audienceGroupIds}
          options={groupOptions}
          onToggle={control.toggleAudienceGroup}
          emptyLabel={groupsEmptyLabel}
          error={groupsErrorText !== undefined}
          helperText={groupsErrorText}
        />
        {reloadButton}
      </>
    ) : null;

  const peoplePicker =
    audience === 'people' ? (
      <CalendarPeoplePicker
        control={control}
        held={heldPeople}
        clubGroups={clubGroups}
        errorText={peopleErrorText}
      />
    ) : null;

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

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkSelectField
        name="audience"
        label={AUDIENCE_LABEL}
        required
        value={audience}
        options={CALENDAR_AUDIENCE_OPTIONS}
        onChange={control.setAudience}
        presentation="choices"
      />
      {groupsPicker}
      {peoplePicker}
      {ownerField}
    </KkFormSection>
  );
};
