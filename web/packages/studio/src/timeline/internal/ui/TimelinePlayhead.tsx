import type { FC } from 'react';
import type { MixPlayer } from '../../../engine/mix-player';
import { useTimeline } from '../logic/timeline-context';
import { TimelinePlayheadLive } from './TimelinePlayheadLive';

interface TimelinePlayheadProps {
  player: MixPlayer;
  playing: boolean;
}

export const TimelinePlayhead: FC<TimelinePlayheadProps> = ({ player, playing }) => {
  const { centre } = useTimeline();

  if (centre !== null) {
    return null;
  }

  return <TimelinePlayheadLive player={player} playing={playing} />;
};
