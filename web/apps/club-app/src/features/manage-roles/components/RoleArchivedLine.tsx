import { KkRoleMark } from '@furria/ui/KkRoleMark';
import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { ROLE_LANDING_KIND } from '../roles-hub';
import { OPEN_ROLE_LABEL, toArchivedSinceLabel } from '../roles-hub-copy';
import type { RolePaneTab, RoleSummary } from '../schemas';

interface RoleArchivedLineProps {
  role: RoleSummary;
  archivedOn: string;
  selected: boolean;
  highlightedKey: string | null;
  compact: boolean;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RoleArchivedLine: FC<RoleArchivedLineProps> = ({
  role,
  archivedOn,
  selected,
  highlightedKey,
  compact,
  onOpen,
}) => {
  const landing = toLandingKey(ROLE_LANDING_KIND, role.roleId);
  const open = (): void => {
    onOpen(role.roleId);
  };
  const mark = <KkRoleMark coin={role.coin} state="archived" />;
  const archived = toArchivedSinceLabel(archivedOn);
  const flags = <KkRoster.Flag icon="archive" label={archived} text={archived} />;

  return (
    <KkRoster.Line
      mark={mark}
      name={role.name}
      flags={flags}
      openLabel={OPEN_ROLE_LABEL}
      selected={selected}
      landing={landing}
      highlight={highlightedKey === landing}
      dimmed
      compact={compact}
      onOpen={open}
    />
  );
};
