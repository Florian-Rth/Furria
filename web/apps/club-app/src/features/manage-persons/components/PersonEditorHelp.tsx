import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { PERSON_EDITOR_HELP_COPY, PERSON_EDITOR_HELP_SPOTS } from '../person-editor-help-copy';

interface PersonEditorHelpProps {
  isEditing: boolean;
}

export const PersonEditorHelp: FC<PersonEditorHelpProps> = ({ isEditing }) => {
  const adoption = isEditing ? null : (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_EDITOR_HELP_COPY.adoption.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_EDITOR_HELP_COPY.adoption.text}</KkHelp.Text>
    </KkHelp.Hint>
  );
  const portrait = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_EDITOR_HELP_COPY.portrait.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_EDITOR_HELP_COPY.portrait.text}</KkHelp.Text>
      <ScreenHelpShow spot={PERSON_EDITOR_HELP_SPOTS.portrait} />
    </KkHelp.Hint>
  ) : null;
  const saving = isEditing
    ? PERSON_EDITOR_HELP_COPY.save.edit
    : PERSON_EDITOR_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{PERSON_EDITOR_HELP_COPY.name.title}</KkHelp.Title>
        <KkHelp.Text>{PERSON_EDITOR_HELP_COPY.name.text}</KkHelp.Text>
        <ScreenHelpShow spot={PERSON_EDITOR_HELP_SPOTS.name} />
      </KkHelp.Hint>
      {adoption}
      <KkHelp.Hint>
        <KkHelp.Title>{PERSON_EDITOR_HELP_COPY.personal.title}</KkHelp.Title>
        <KkHelp.Text>{PERSON_EDITOR_HELP_COPY.personal.text}</KkHelp.Text>
        <ScreenHelpShow spot={PERSON_EDITOR_HELP_SPOTS.personal} />
      </KkHelp.Hint>
      {portrait}
      <KkHelp.Hint>
        <KkHelp.Title>{PERSON_EDITOR_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{PERSON_EDITOR_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
