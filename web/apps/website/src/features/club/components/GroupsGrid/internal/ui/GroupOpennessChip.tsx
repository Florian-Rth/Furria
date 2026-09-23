import { KkChip } from '@furria/ui';
import type { FC } from 'react';
import type { GroupOpenness } from '@/features/club/groups-content';

interface GroupOpennessChipProps {
  openness: GroupOpenness;
}

export const GroupOpennessChip: FC<GroupOpennessChipProps> = ({ openness }) => (
  <KkChip tone={openness.tone} dot={openness.dot} size="small">
    {openness.label}
  </KkChip>
);
