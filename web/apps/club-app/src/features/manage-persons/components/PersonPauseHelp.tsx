import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { PAUSE_HELP_COPY, PAUSE_HELP_SPOTS } from '../person-pause-help-copy';

interface PersonPauseHelpProps {
  isEditing: boolean;
}

export const PersonPauseHelp: FC<PersonPauseHelpProps> = ({ isEditing }) => {
  const saving = isEditing ? PAUSE_HELP_COPY.save.edit : PAUSE_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{PAUSE_HELP_COPY.span.title}</KkHelp.Title>
        <KkHelp.Text>{PAUSE_HELP_COPY.span.text}</KkHelp.Text>
        <KkHelp.Text>{PAUSE_HELP_COPY.span.fit}</KkHelp.Text>
        <ScreenHelpShow spot={PAUSE_HELP_SPOTS.span} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{PAUSE_HELP_COPY.meaning.title}</KkHelp.Title>
        <KkHelp.Text>{PAUSE_HELP_COPY.meaning.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{PAUSE_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{PAUSE_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
