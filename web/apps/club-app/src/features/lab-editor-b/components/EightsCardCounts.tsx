import { KkEightsReel } from '@furria/ui/KkEightsReel';
import type { FC } from 'react';
import { EIGHTS_CARD_COUNTS } from '../eights-copy';
import type { EightsCardCount } from '../hooks/use-eights-reel';

interface EightsCardCountsProps {
  counts: readonly EightsCardCount[];
  lit: number;
  onSeek: (seconds: number) => void;
}

export const EightsCardCounts: FC<EightsCardCountsProps> = ({ counts, lit, onSeek }) => {
  const cells = counts.map((cell) => (
    <KkEightsReel.Count
      key={cell.key}
      column={cell.column}
      count={cell.count}
      seconds={cell.seconds}
      label={cell.label}
      lit={cell.index === lit}
      keyed={cell.keyed}
      onSeek={onSeek}
    />
  ));

  return <KkEightsReel.Counts label={EIGHTS_CARD_COUNTS}>{cells}</KkEightsReel.Counts>;
};
