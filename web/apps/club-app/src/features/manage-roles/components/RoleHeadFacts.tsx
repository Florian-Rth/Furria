import { KkMeta } from '@furria/ui';
import type { FC } from 'react';
import { toArchivedSinceLabel } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { RoleFlags } from './RoleFlags';

interface RoleHeadFactsProps {
  role: RoleSummary;
  totalKeys: number;
}

export const RoleHeadFacts: FC<RoleHeadFactsProps> = ({ role, totalKeys }) => {
  if (role.archivedOn !== null) {
    return <KkMeta>{toArchivedSinceLabel(role.archivedOn)}</KkMeta>;
  }

  return <RoleFlags role={role} totalKeys={totalKeys} />;
};
