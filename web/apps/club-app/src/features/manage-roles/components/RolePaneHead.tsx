import { KkOfficeHead } from '@furria/ui/KkOfficeHead';
import { KkRoleMark } from '@furria/ui/KkRoleMark';
import type { FC, ReactNode } from 'react';
import { toRoleMarkState } from '../roles-hub';
import type { RoleSummary } from '../schemas';
import { RoleHeadFacts } from './RoleHeadFacts';

interface RolePaneHeadProps {
  role: RoleSummary;
  totalKeys: number;
  actions?: ReactNode;
}

export const RolePaneHead: FC<RolePaneHeadProps> = ({ role, totalKeys, actions }) => {
  const mark = <KkRoleMark coin={role.coin} state={toRoleMarkState(role)} size="large" />;
  const facts = <RoleHeadFacts role={role} totalKeys={totalKeys} />;

  return <KkOfficeHead mark={mark} title={role.name} facts={facts} actions={actions} />;
};
