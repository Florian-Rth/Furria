import type { FC, ReactNode } from 'react';
import { Fragment } from 'react';
import type { ManagedGroupSummary } from '../schemas';
import { GroupRegisterRow } from './GroupRegisterRow';

interface GroupRegisterBandProps {
  groups: readonly ManagedGroupSummary[];
  selectedId: number | null;
  detail: ReactNode;
  onSelect: (groupId: number) => void;
  onAppointAdmin: (groupId: number) => void;
  onEdit: (groupId: number) => void;
  onArchive: (groupId: number) => void;
  onRestore: (groupId: number) => void;
}

export const GroupRegisterBand: FC<GroupRegisterBandProps> = ({
  groups,
  selectedId,
  detail,
  onSelect,
  onAppointAdmin,
  onEdit,
  onArchive,
  onRestore,
}) => (
  <>
    {groups.map((group) => {
      const expansion = group.groupId === selectedId ? detail : null;

      return (
        <Fragment key={group.groupId}>
          <GroupRegisterRow
            group={group}
            selectedId={selectedId}
            onSelect={onSelect}
            onAppointAdmin={onAppointAdmin}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
          />
          {expansion}
        </Fragment>
      );
    })}
  </>
);
