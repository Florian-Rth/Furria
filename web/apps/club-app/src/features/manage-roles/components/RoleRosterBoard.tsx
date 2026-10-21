import { KkMeta } from '@furria/ui';
import type { FC } from 'react';
import { toBoardFlag } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';

interface RoleRosterBoardProps {
  role: RoleSummary;
}

export const RoleRosterBoard: FC<RoleRosterBoardProps> = ({ role }) => {
  const flag = toBoardFlag(role);

  if (flag === null) {
    return null;
  }

  return <KkMeta component="span">{flag.text}</KkMeta>;
};
