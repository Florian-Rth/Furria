import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { INTAKE_EDITOR_HELP_COPY, INTAKE_EDITOR_HELP_SPOTS } from '../intake-editor-help-copy';
import { IntakeEditorHelpGroupsPreview } from './IntakeEditorHelpGroupsPreview';

interface IntakeEditorHelpProps {
  isEditing: boolean;
  decidesMembership: boolean;
}

export const IntakeEditorHelp: FC<IntakeEditorHelpProps> = ({ isEditing, decidesMembership }) => {
  const groupAdmin = decidesMembership ? null : (
    <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.groups.groupAdmin}</KkHelp.Text>
  );
  const membership = decidesMembership ? (
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_EDITOR_HELP_COPY.membership.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.membership.text}</KkHelp.Text>
      <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.membership.needs}</KkHelp.Text>
      <ScreenHelpShow spot={INTAKE_EDITOR_HELP_SPOTS.membership} />
    </KkHelp.Hint>
  ) : null;
  const saving = isEditing
    ? INTAKE_EDITOR_HELP_COPY.save.edit
    : INTAKE_EDITOR_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <IntakeEditorHelpGroupsPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{INTAKE_EDITOR_HELP_COPY.groups.title}</KkHelp.Title>
        <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.groups.text}</KkHelp.Text>
        {groupAdmin}
        <ScreenHelpShow spot={INTAKE_EDITOR_HELP_SPOTS.groups} />
      </KkHelp.Hint>
      {membership}
      <KkHelp.Hint>
        <KkHelp.Title>{INTAKE_EDITOR_HELP_COPY.label.title}</KkHelp.Title>
        <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.label.text}</KkHelp.Text>
        <ScreenHelpShow spot={INTAKE_EDITOR_HELP_SPOTS.label} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{INTAKE_EDITOR_HELP_COPY.her.title}</KkHelp.Title>
        <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.her.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{INTAKE_EDITOR_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{INTAKE_EDITOR_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
