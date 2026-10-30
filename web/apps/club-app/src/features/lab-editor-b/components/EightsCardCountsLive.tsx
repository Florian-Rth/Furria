import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { markIndexAt } from '../count-sheet';
import type { EightsCardCount } from '../hooks/use-eights-reel';
import { EightsCardCounts } from './EightsCardCounts';

interface EightsCardCountsLiveProps {
  playback: StudioPlayback;
  counts: readonly EightsCardCount[];
  onSeek: (seconds: number) => void;
}

export const EightsCardCountsLive: FC<EightsCardCountsLiveProps> = ({
  playback,
  counts,
  onSeek,
}) => {
  const lit = usePlaybackSelection(playback.player, (seconds) =>
    markIndexAt(playback.countMarks, seconds),
  );

  return <EightsCardCounts counts={counts} lit={lit} onSeek={onSeek} />;
};
