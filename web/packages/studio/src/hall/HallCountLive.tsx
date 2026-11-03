import type { MixPlayer } from '@furria/studio/mix-player';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { useHallCount } from '@furria/studio/use-hall-count';
import { KkHall } from '@furria/ui/KkHall';
import type { FC } from 'react';

interface HallCountLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const HallCountLive: FC<HallCountLiveProps> = ({ player, segments }) => {
  const live = useHallCount(player, segments);

  return <KkHall.Count count={live.count} leading={live.leading} label={live.label} />;
};
