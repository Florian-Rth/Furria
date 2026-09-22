import type { FC } from 'react';
import type { ManagedGroupSummary } from '../schemas';
import { GroupRegisterRow } from './GroupRegisterRow';

interface GroupRegisterBandProps {
  groups: readonly ManagedGroupSummary[];
  onAppointAdmin: (groupId: number) => void;
  onEdit: (groupId: number) => void;
  onArchive: (groupId: number) => void;
  onRestore: (groupId: number) => void;
}

export const GroupRegisterBand: FC<GroupRegisterBandProps> = ({
  groups,
  onAppointAdmin,
  onEdit,
  onArchive,
  onRestore,
}) => (
  <>
    {groups.map((group) => (
      <GroupRegisterRow
        key={group.groupId}
        group={group}
        onAppointAdmin={onAppointAdmin}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
      />
    ))}
  </>
);
