import { KkChip } from '@furria/ui';
import type { FC } from 'react';
import type { GroupOpenness } from '@/features/club/groups-content';

interface GruppenOpennessChipProps {
  openness: GroupOpenness;
}

export const GruppenOpennessChip: FC<GruppenOpennessChipProps> = ({ openness }) => (
  <KkChip tone={openness.tone} dot={openness.dot} size="small">
    {openness.label}
  </KkChip>
);
