import { countIndexAt } from '@furria/studio/count-marks';
import type { StepCountCell } from '@furria/studio/step-cards';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';
import type { FC } from 'react';
import { StepCardCounts } from './StepCardCounts';

interface StepCardCountsLiveProps {
  playback: StudioPlayback;
  cells: readonly StepCountCell[];
  onSeek: (seconds: number) => void;
}

export const StepCardCountsLive: FC<StepCardCountsLiveProps> = ({ playback, cells, onSeek }) => {
  const lit = usePlaybackSelection(playback.player, (seconds) =>
    countIndexAt(playback.countMarks, seconds),
  );

  return <StepCardCounts cells={cells} lit={lit} onSeek={onSeek} />;
};
