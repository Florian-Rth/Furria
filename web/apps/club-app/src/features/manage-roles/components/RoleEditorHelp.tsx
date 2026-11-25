import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ROLES_HELP_COPY, ROLES_HELP_SPOTS } from '../roles-help-copy';

interface RoleEditorHelpProps {
  isEditing: boolean;
}

export const RoleEditorHelp: FC<RoleEditorHelpProps> = ({ isEditing }) => {
  const closing = isEditing ? ROLES_HELP_COPY.editorSave : ROLES_HELP_COPY.editorCreate;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{ROLES_HELP_COPY.editorCore.title}</KkHelp.Title>
        <KkHelp.Text>{ROLES_HELP_COPY.editorCore.text}</KkHelp.Text>
        <ScreenHelpShow spot={ROLES_HELP_SPOTS.coreSection} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ROLES_HELP_COPY.editorCoin.title}</KkHelp.Title>
        <KkHelp.Text>{ROLES_HELP_COPY.editorCoin.text}</KkHelp.Text>
        <ScreenHelpShow spot={ROLES_HELP_SPOTS.coinSection} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{closing.title}</KkHelp.Title>
        <KkHelp.Text>{closing.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
