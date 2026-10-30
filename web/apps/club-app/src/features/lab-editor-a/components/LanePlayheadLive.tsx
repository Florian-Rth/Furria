import { KkLaneTrack } from '@furria/ui/KkLaneTrack';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { useLaneFollow } from '../hooks/use-lane-follow';
import type { LaneZoom } from '../hooks/use-lane-zoom';
import { shareOf } from '../lane-time';

interface LanePlayheadLiveProps {
  player: MixPlayer;
  length: number;
  playing: boolean;
  zoom: LaneZoom;
}

export const LanePlayheadLive: FC<LanePlayheadLiveProps> = ({ player, length, playing, zoom }) => {
  const seconds = usePlaybackSeconds(player);
  useLaneFollow(seconds, playing, zoom);

  return <KkLaneTrack.Playhead share={shareOf(seconds, length)} />;
};
