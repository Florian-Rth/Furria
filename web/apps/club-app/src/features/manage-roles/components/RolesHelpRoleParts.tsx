import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ROLES_HELP_COPY } from '../roles-help-copy';
import { RolesHelpRights } from './RolesHelpRights';

export const RolesHelpRoleParts: FC = () => (
  <>
    <RolesHelpRights />
    <KkHelp.Hint>
      <KkHelp.Title>{ROLES_HELP_COPY.holders.title}</KkHelp.Title>
      <KkHelp.Text>{ROLES_HELP_COPY.holders.text}</KkHelp.Text>
      <KkHelp.Text>{ROLES_HELP_COPY.holders.history}</KkHelp.Text>
      <KkHelp.Text>{ROLES_HELP_COPY.holders.board}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{ROLES_HELP_COPY.settings.title}</KkHelp.Title>
      <KkHelp.Text>{ROLES_HELP_COPY.settings.text}</KkHelp.Text>
      <KkHelp.Text>{ROLES_HELP_COPY.settings.coin}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{ROLES_HELP_COPY.archive.title}</KkHelp.Title>
      <KkHelp.Text>{ROLES_HELP_COPY.archive.text}</KkHelp.Text>
    </KkHelp.Hint>
  </>
);
