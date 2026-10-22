import { KkRoleMark } from '@furria/ui/KkRoleMark';
import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { ROLE_LANDING_KIND, toRoleMarkState } from '../roles-hub';
import { OPEN_ROLE_LABEL } from '../roles-hub-copy';
import type { RolePaneTab, RoleSummary } from '../schemas';
import { RoleRightsFlag } from './RoleRightsFlag';
import { RoleRosterBoard } from './RoleRosterBoard';
import { RoleRosterBrief } from './RoleRosterBrief';
import { RoleRosterHolders } from './RoleRosterHolders';

interface RoleRosterLineProps {
  role: RoleSummary;
  totalKeys: number;
  compact: boolean;
  selected: boolean;
  highlightedKey: string | null;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RoleRosterLine: FC<RoleRosterLineProps> = ({
  role,
  totalKeys,
  compact,
  selected,
  highlightedKey,
  onOpen,
}) => {
  const landing = toLandingKey(ROLE_LANDING_KIND, role.roleId);
  const open = (): void => {
    onOpen(role.roleId);
  };
  const mark = <KkRoleMark coin={role.coin} state={toRoleMarkState(role)} />;
  const flags = <RoleRightsFlag role={role} totalKeys={totalKeys} />;

  return (
    <KkRoster.Line
      mark={mark}
      name={role.name}
      flags={flags}
      openLabel={OPEN_ROLE_LABEL}
      selected={selected}
      landing={landing}
      highlight={highlightedKey === landing}
      compact={compact}
      onOpen={open}
    >
      <RoleRosterBrief description={role.description} />
      <RoleRosterHolders role={role} />
      <RoleRosterBoard role={role} />
    </KkRoster.Line>
  );
};
