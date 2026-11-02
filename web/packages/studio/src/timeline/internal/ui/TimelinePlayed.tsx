import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { MixPlayer } from '../../../engine/mix-player';
import { usePlaybackSeconds } from '../../../engine/use-playback-seconds';
import { shareOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

interface TimelinePlayedProps {
  player: MixPlayer;
  playing: boolean;
  bars: readonly number[];
}

export const TimelinePlayed: FC<TimelinePlayedProps> = ({ player, playing, bars }) => {
  const { length } = useTimeline();
  const share = shareOf(usePlaybackSeconds(player), length);

  if (share <= 0 && !playing) {
    return null;
  }

  return <KkTimeline.Played bars={bars} share={share} />;
};
