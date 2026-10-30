import { KkEightsReel } from '@furria/ui/KkEightsReel';
import type { FC } from 'react';
import type { StepCountCell } from '../step-cards';
import { countCellLabelOf, STEP_CARD_COUNTS } from '../step-cards-copy';

interface StepCardCountsProps {
  cells: readonly StepCountCell[];
  lit: number;
  onSeek: (seconds: number) => void;
}

export const StepCardCounts: FC<StepCardCountsProps> = ({ cells, lit, onSeek }) => {
  const counts = cells.map((cell) => (
    <KkEightsReel.Count
      key={cell.key}
      column={cell.column}
      count={cell.count}
      seconds={cell.seconds}
      label={countCellLabelOf(cell.eight, cell.count, cell.seconds)}
      lit={cell.index === lit}
      keyed={cell.keyed}
      onSeek={onSeek}
    />
  ));

  return <KkEightsReel.Counts label={STEP_CARD_COUNTS}>{counts}</KkEightsReel.Counts>;
};
