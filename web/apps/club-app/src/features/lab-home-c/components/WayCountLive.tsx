import { KkWayStep } from '@furria/ui/KkWayStep';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
import { countLabelOf } from '@/features/act-practice/practice-copy';

interface WayCountLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const WayCountLive: FC<WayCountLiveProps> = ({ player, segments }) => {
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );

  return <KkWayStep.Count count={count} label={countLabelOf(count)} />;
};
