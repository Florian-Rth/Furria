import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import { KkMultiSelectField } from '@furria/ui/KkMultiSelectField';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { toParticipantsEmptyLabel, toParticipatingGroupOptions } from '../calendar-authoring';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { ParticipatingGroup } from '../schemas';
import { CalendarGroupsReloadButton } from './CalendarGroupsReloadButton';

const REMOVE_LABEL = 'Mitwirkende Gruppen entfernen';
const GROUPS_LABEL = 'Gruppen';

interface CalendarParticipatingGroupsCardProps {
  control: CalendarEntryEditorControl;
  held: readonly ParticipatingGroup[];
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload | null;
  onRemove: () => void;
}

export const CalendarParticipatingGroupsCard: FC<CalendarParticipatingGroupsCardProps> = ({
  control,
  held,
  clubGroups,
  clubGroupsReload,
  onRemove,
}) => {
  const errorText = control.form.formState.errors.participatingGroupIds?.message;
  const options = toParticipatingGroupOptions(clubGroups, held, control.values.ownerId);
  const emptyLabel = toParticipantsEmptyLabel(clubGroups);

  const reloadButton =
    clubGroupsReload === null ? null : <CalendarGroupsReloadButton reload={clubGroupsReload} />;

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.participatingGroups}
      title={CALENDAR_ADD_ON_LABELS.participatingGroups}
      removeLabel={REMOVE_LABEL}
      onRemove={onRemove}
    >
      <KkMultiSelectField
        name="participatingGroupIds"
        label={GROUPS_LABEL}
        required
        values={control.values.participatingGroupIds}
        options={options}
        onToggle={control.toggleParticipatingGroup}
        emptyLabel={emptyLabel}
        error={errorText !== undefined}
        helperText={errorText}
      />
      {reloadButton}
    </KkAddOnCard>
  );
};
