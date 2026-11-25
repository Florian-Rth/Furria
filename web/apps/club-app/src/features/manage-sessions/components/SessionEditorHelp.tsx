import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SESSION_EDITOR_HELP_COPY, SESSION_EDITOR_HELP_SPOTS } from '../sessions-help-copy';

interface SessionEditorHelpProps {
  isEditing: boolean;
}

export const SessionEditorHelp: FC<SessionEditorHelpProps> = ({ isEditing }) => {
  const saving = isEditing
    ? SESSION_EDITOR_HELP_COPY.save.edit
    : SESSION_EDITOR_HELP_COPY.save.create;
  const remove = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{SESSION_EDITOR_HELP_COPY.remove.title}</KkHelp.Title>
      <KkHelp.Text>{SESSION_EDITOR_HELP_COPY.remove.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{SESSION_EDITOR_HELP_COPY.session.title}</KkHelp.Title>
        <KkHelp.Text>{SESSION_EDITOR_HELP_COPY.session.text}</KkHelp.Text>
        <ScreenHelpShow spot={SESSION_EDITOR_HELP_SPOTS.session} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SESSION_EDITOR_HELP_COPY.motto.title}</KkHelp.Title>
        <KkHelp.Text>{SESSION_EDITOR_HELP_COPY.motto.text}</KkHelp.Text>
        <KkHelp.Text>{SESSION_EDITOR_HELP_COPY.motto.logo}</KkHelp.Text>
        <ScreenHelpShow spot={SESSION_EDITOR_HELP_SPOTS.motto} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SESSION_EDITOR_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
      </KkHelp.Hint>
      {remove}
    </ScreenHelp>
  );
};
