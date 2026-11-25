import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { RolesHelpRoleParts } from './RolesHelpRoleParts';

export const RoleHelp: FC = () => (
  <ScreenHelp>
    <RolesHelpRoleParts />
  </ScreenHelp>
);
