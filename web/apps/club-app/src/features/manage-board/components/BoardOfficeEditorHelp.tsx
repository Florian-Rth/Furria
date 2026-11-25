import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { BOARD_HELP_COPY, BOARD_HELP_ROLE_CHIP, BOARD_HELP_SPOTS } from '../board-help-copy';

interface BoardOfficeEditorHelpProps {
  isEditing: boolean;
  canChangeRole: boolean;
}

export const BoardOfficeEditorHelp: FC<BoardOfficeEditorHelpProps> = ({
  isEditing,
  canChangeRole,
}) => {
  const roleChip = canChangeRole ? BOARD_HELP_ROLE_CHIP : undefined;
  const readOnly = canChangeRole ? null : (
    <KkHelp.Text>{BOARD_HELP_COPY.editorRole.readOnly}</KkHelp.Text>
  );
  const role = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={roleChip}>{BOARD_HELP_COPY.editorRole.title}</KkHelp.Title>
      <KkHelp.Text>{BOARD_HELP_COPY.editorRole.text}</KkHelp.Text>
      {readOnly}
      <ScreenHelpShow spot={BOARD_HELP_SPOTS.role} />
    </KkHelp.Hint>
  ) : null;
  const closing = isEditing ? BOARD_HELP_COPY.editorSave : BOARD_HELP_COPY.editorCreate;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{BOARD_HELP_COPY.editorOffice.title}</KkHelp.Title>
        <KkHelp.Text>{BOARD_HELP_COPY.editorOffice.text}</KkHelp.Text>
        <KkHelp.Text>{BOARD_HELP_COPY.editorOffice.order}</KkHelp.Text>
        <ScreenHelpShow spot={BOARD_HELP_SPOTS.office} />
      </KkHelp.Hint>
      {role}
      <KkHelp.Hint>
        <KkHelp.Title>{closing.title}</KkHelp.Title>
        <KkHelp.Text>{closing.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
