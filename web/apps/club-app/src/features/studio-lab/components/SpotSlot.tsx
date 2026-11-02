import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { SpotSlotView } from '../hooks/use-lists-playground';
import { OPEN_SPOT } from '../studio-lab-copy';
import { HolderChip } from './HolderChip';
import { SpotDropSlot } from './SpotDropSlot';

interface SpotSlotProps {
  spot: SpotSlotView;
}

export const SpotSlot: FC<SpotSlotProps> = ({ spot }) => {
  const content =
    spot.holder === null ? (
      <KkTouchLab.Hint text={OPEN_SPOT} />
    ) : (
      <HolderChip holder={spot.holder} />
    );

  return (
    <SpotDropSlot id={spot.spotId} label={spot.label}>
      {content}
    </SpotDropSlot>
  );
};
