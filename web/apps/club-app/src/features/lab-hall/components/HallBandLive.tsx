import { KkHall } from '@furria/ui/KkHall';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { useHallCount } from '../hooks/use-hall-count';

interface HallBandLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const HallBandLive: FC<HallBandLiveProps> = ({ player, segments }) => {
  const live = useHallCount(player, segments);

  return <KkHall.Band count={live.count} leading={live.leading} label={live.label} />;
};
