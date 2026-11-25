import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ROLES_HELP_COPY, ROLES_HELP_SPOTS } from '../roles-help-copy';
import { RolesHelpRoleParts } from './RolesHelpRoleParts';

export const RolesHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{ROLES_HELP_COPY.view.title}</KkHelp.Title>
      <KkHelp.Text>{ROLES_HELP_COPY.view.text}</KkHelp.Text>
      <KkHelp.Text>{ROLES_HELP_COPY.view.rights}</KkHelp.Text>
      <ScreenHelpShow spot={ROLES_HELP_SPOTS.view} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{ROLES_HELP_COPY.list.title}</KkHelp.Title>
      <KkHelp.Text>{ROLES_HELP_COPY.list.text}</KkHelp.Text>
      <KkHelp.Text>{ROLES_HELP_COPY.list.archived}</KkHelp.Text>
    </KkHelp.Hint>
    <RolesHelpRoleParts />
    <KkHelp.Hint>
      <KkHelp.Title>{ROLES_HELP_COPY.add.title}</KkHelp.Title>
      <KkHelp.Text>{ROLES_HELP_COPY.add.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
