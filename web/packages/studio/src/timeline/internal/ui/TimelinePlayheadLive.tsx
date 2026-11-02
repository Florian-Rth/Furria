import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { MixPlayer } from '../../../engine/mix-player';
import { usePlaybackSeconds } from '../../../engine/use-playback-seconds';
import { shareOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

interface TimelinePlayheadLiveProps {
  player: MixPlayer;
  playing: boolean;
}

export const TimelinePlayheadLive: FC<TimelinePlayheadLiveProps> = ({ player, playing }) => {
  const { length } = useTimeline();
  const share = shareOf(usePlaybackSeconds(player), length);

  if (share <= 0 && !playing) {
    return null;
  }

  return <KkTimeline.Playhead share={share} />;
};
