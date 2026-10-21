import { KkRoleMark, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { toRoleMarkState } from '../roles-hub';
import type { RoleSummary } from '../schemas';
import { RoleHeadFacts } from './RoleHeadFacts';

interface RoleHeaderProps {
  role: RoleSummary;
  totalKeys: number;
}

export const RoleHeader: FC<RoleHeaderProps> = ({ role, totalKeys }) => (
  <KkScreenHeader>
    <KkScreenHeader.Visual>
      <KkRoleMark coin={role.coin} state={toRoleMarkState(role)} size="large" />
    </KkScreenHeader.Visual>
    <KkScreenHeader.Text>
      <KkScreenHeader.Title transform="none">{role.name}</KkScreenHeader.Title>
      <RoleHeadFacts role={role} totalKeys={totalKeys} />
    </KkScreenHeader.Text>
  </KkScreenHeader>
);
