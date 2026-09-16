import Stack from '@mui/material/Stack';
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
  <Stack sx={{ gap: 3.5, minWidth: 0 }}>
    <ManagedGroupHeaderCard
      group={group}
      onEdit={onEdit}
      onArchive={onArchive}
      onRestore={onRestore}
    />
    <GroupOverrideBody groupId={group.groupId} />
  </Stack>
);
