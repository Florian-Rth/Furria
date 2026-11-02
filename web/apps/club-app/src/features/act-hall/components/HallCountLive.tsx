import type { MixPlayer } from '@furria/studio/mix-player';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { KkHall } from '@furria/ui/KkHall';
import type { FC } from 'react';
import { useHallCount } from '../hooks/use-hall-count';

interface HallCountLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const HallCountLive: FC<HallCountLiveProps> = ({ player, segments }) => {
  const live = useHallCount(player, segments);

  return <KkHall.Count count={live.count} leading={live.leading} label={live.label} />;
};
