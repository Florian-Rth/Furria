import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMultiSelectField } from '@furria/ui/KkMultiSelectField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import type { CalendarAudienceReach } from '../calendar-audience-reach';
import { toOfferedAudiences, toReachablePool } from '../calendar-audience-reach';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toAudienceGroupOptions, toParticipantsEmptyLabel } from '../calendar-authoring';
import { NOTIFY_LABEL, toAudienceOptions, toNotifyReachLine } from '../calendar-labels';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import { toNotifyReach } from '../notify-reach';
import type { AudienceGroup, AudiencePerson, CalendarEntryAudience } from '../schemas';
import { CalendarGroupsReloadButton } from './CalendarGroupsReloadButton';
import { CalendarPeoplePicker } from './CalendarPeoplePicker';

const SECTION_TITLE = 'Für wen';
const AUDIENCE_LABEL = 'Für wen';
const GROUPS_LABEL = 'Gruppen';
const OWNER_LABEL = 'Eigentümer';

interface CalendarEntryAudienceSectionProps {
  control: CalendarEntryEditorControl;
  ownerOptions: readonly KkSelectOption[];
  reach: CalendarAudienceReach;
  heldAudience: CalendarEntryAudience | null;
  heldGroups: readonly AudienceGroup[];
  heldPeople: readonly AudiencePerson[];
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload | null;
}

export const CalendarEntryAudienceSection: FC<CalendarEntryAudienceSectionProps> = ({
  control,
  ownerOptions,
  reach,
  heldAudience,
  heldGroups,
  heldPeople,
  clubGroups,
  clubGroupsReload,
}) => {
  const errors = control.form.formState.errors;
  const groupsErrorText = errors.audienceGroupIds?.message;
  const peopleErrorText = errors.audiencePersonIds?.message;
  const audience = control.values.audience;
  const audienceOptions = toAudienceOptions(toOfferedAudiences(reach, heldAudience));
  const reachableGroups = toReachablePool(clubGroups, reach);
  const groupOptions = toAudienceGroupOptions(clubGroups, heldGroups, reachableGroups);
  const groupsEmptyLabel = toParticipantsEmptyLabel(reachableGroups);

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
        reach={reach}
        reachableGroups={reachableGroups}
        errorText={peopleErrorText}
      />
    ) : null;

  const notify = control.notify;
  const notifyReachLine =
    notify === null ? undefined : toNotifyReachLine(toNotifyReach(control.values, clubGroups));
  const notifySwitch =
    notify === null ? null : (
      <KkSwitchRow
        label={NOTIFY_LABEL}
        description={notifyReachLine}
        checked={notify.checked}
        onChange={notify.set}
        stateChip={false}
        disabled={control.isSaving}
      />
    );

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
        options={audienceOptions}
        onChange={control.setAudience}
        presentation="choices"
      />
      {groupsPicker}
      {peoplePicker}
      {notifySwitch}
      {ownerField}
    </KkFormSection>
  );
};
