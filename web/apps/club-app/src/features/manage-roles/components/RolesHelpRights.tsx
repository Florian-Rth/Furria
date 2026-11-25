import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ROLES_HELP_COPY } from '../roles-help-copy';
import { RolesHelpRightPreview } from './RolesHelpRightPreview';

export const RolesHelpRights: FC = () => (
  <KkHelp.Hint>
    <KkHelp.Preview>
      <RolesHelpRightPreview />
    </KkHelp.Preview>
    <KkHelp.Title>{ROLES_HELP_COPY.rights.title}</KkHelp.Title>
    <KkHelp.Text>{ROLES_HELP_COPY.rights.text}</KkHelp.Text>
    <KkHelp.Text>{ROLES_HELP_COPY.rights.roles}</KkHelp.Text>
    <KkHelp.Text>{ROLES_HELP_COPY.rights.self}</KkHelp.Text>
  </KkHelp.Hint>
);
