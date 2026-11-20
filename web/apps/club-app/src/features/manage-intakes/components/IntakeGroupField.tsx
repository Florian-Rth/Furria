import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkNote } from '@furria/ui/KkNote';
import { KkToggleChips } from '@furria/ui/KkToggleChips';
import type { FC } from 'react';
import type { IntakeEditorControl } from '../hooks/use-intake-editor';
import {
  GROUPS_LABEL,
  GROUPS_SECTION,
  LOCKED_GROUPS_NOTE,
  NO_GROUPS_TO_CHOOSE,
} from '../intake-labels';

interface IntakeGroupFieldProps {
  control: IntakeEditorControl;
}

export const IntakeGroupField: FC<IntakeGroupFieldProps> = ({ control }) => {
  const { chips, hasLocked } = control.groupChips;
  const lockedNote = hasLocked ? <KkNote tone="muted">{LOCKED_GROUPS_NOTE}</KkNote> : null;
  const error =
    control.groupsError === undefined ? null : (
      <KkNote tone="warning" icon="alert">
        {control.groupsError}
      </KkNote>
    );
  const picker =
    chips.length === 0 ? (
      <KkNote tone="muted">{NO_GROUPS_TO_CHOOSE}</KkNote>
    ) : (
      <KkToggleChips
        label={GROUPS_LABEL}
        chips={chips}
        selected={control.chosenGroupIds}
        onToggle={control.toggleGroup}
      />
    );

  return (
    <KkFormSection title={GROUPS_SECTION}>
      {picker}
      {lockedNote}
      {error}
    </KkFormSection>
  );
};
