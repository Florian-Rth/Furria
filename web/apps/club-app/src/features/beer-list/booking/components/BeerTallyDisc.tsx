import type { KkTabDiscSize } from '@furria/ui/KkTabDisc';
import { KkTabDisc } from '@furria/ui/KkTabDisc';
import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import type { FC } from 'react';
import type { BeerTabTotals } from '../../beer-tab';
import { discLabel } from '../booking-copy';

interface BeerTallyDiscProps {
  strokes: readonly KkTabStrokeState[];
  totals: BeerTabTotals;
  drawKey: number;
  burstKey?: number;
  size?: KkTabDiscSize;
}

export const BeerTallyDisc: FC<BeerTallyDiscProps> = ({
  strokes,
  totals,
  drawKey,
  burstKey,
  size = 'medium',
}) => {
  const label = discLabel(totals.openCount, totals.paidCount);

  return (
    <KkTabDisc strokes={strokes} label={label} size={size} drawKey={drawKey} burstKey={burstKey} />
  );
};
