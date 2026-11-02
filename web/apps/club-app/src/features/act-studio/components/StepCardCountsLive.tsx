import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StepCountCell } from '../step-cards';
import { countIndexAt } from '../step-cards';
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
