import { KkMeta } from '@furria/ui';
import type { FC } from 'react';
import { GroupCardBody } from '@/features/groups';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { toHolderUnitLabel, toNoDescriptionLine } from '../manage-roles-labels';
import { RoleStateChips } from './RoleStateChips';

const ROLES_PATH = '/manage/roles';
const FULL_HEIGHT = { height: '100%' } as const;

interface RoleCardProps {
  entry: RoleMasterEntry;
}

export const RoleCard: FC<RoleCardProps> = ({ entry }) => {
  const holderLine = entry.meta === null ? undefined : <KkMeta>{entry.meta}</KkMeta>;
  const unitLabel = toHolderUnitLabel(entry.holderCount);
  const emptyDescription = toNoDescriptionLine(entry.name);
  const chips = <RoleStateChips isArchived={entry.isArchived} isUnheld={entry.isUnheld} />;

  return (
    <GroupCardBody
      name={entry.name}
      count={entry.holderCount}
      unitLabel={unitLabel}
      description={entry.description}
      emptyDescription={emptyDescription}
      chips={chips}
      footer={holderLine}
      dimmed={entry.isArchived}
      to={ROLES_PATH}
      search={{ role: entry.roleId }}
      sx={FULL_HEIGHT}
    />
  );
};
