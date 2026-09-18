import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import type { ManagedGroupSummary } from '../schemas';
import { GroupOverrideBody } from './GroupOverrideBody';
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
  <KkPanelStack>
    <ManagedGroupHeaderCard
      group={group}
      onEdit={onEdit}
      onArchive={onArchive}
      onRestore={onRestore}
    />
    <GroupOverrideBody groupId={group.groupId} />
  </KkPanelStack>
);
