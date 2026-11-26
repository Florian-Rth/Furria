import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { GROUPS_HELP_COPY, GROUPS_HELP_SPOTS } from '../manage-groups-help-copy';

export const GroupCreateHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.createForm.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.createForm.text}</KkHelp.Text>
      <ScreenHelpShow spot={GROUPS_HELP_SPOTS.createForm} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.add.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.createForm.after}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
