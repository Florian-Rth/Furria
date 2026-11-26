import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { GROUPS_HELP_COPY, GROUPS_HELP_SPOTS } from '../manage-groups-help-copy';

interface GroupKindEditorHelpProps {
  isEditing: boolean;
}

export const GroupKindEditorHelp: FC<GroupKindEditorHelpProps> = ({ isEditing }) => {
  const saving = isEditing ? GROUPS_HELP_COPY.kindSave.edit : GROUPS_HELP_COPY.kindSave.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{GROUPS_HELP_COPY.kindForm.title}</KkHelp.Title>
        <KkHelp.Text>{GROUPS_HELP_COPY.kinds.text}</KkHelp.Text>
        <KkHelp.Text>{GROUPS_HELP_COPY.kindForm.text}</KkHelp.Text>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <ScreenHelpShow spot={GROUPS_HELP_SPOTS.kindForm} />
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
