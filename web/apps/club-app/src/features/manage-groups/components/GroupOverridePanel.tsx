import type { FC } from 'react';
import type { ManagedGroupSummary } from '../schemas';
import { ManagedGroupHeaderCard } from './ManagedGroupHeaderCard';

interface GroupOverridePanelProps {
  group: ManagedGroupSummary;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export const GroupOverridePanel: FC<GroupOverridePanelProps> = ({
  group,
  onEdit,
  onArchive,
  onRestore,
}) => (
  <ManagedGroupHeaderCard
    group={group}
    onEdit={onEdit}
    onArchive={onArchive}
    onRestore={onRestore}
  />
);
