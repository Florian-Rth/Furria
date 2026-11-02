import type { MixPlayer } from '@furria/studio/mix-player';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkLaneTrack } from '@furria/ui/KkLaneTrack';
import type { FC } from 'react';
import { shareOf } from '../desk-time';
import { useDeskFollow } from '../hooks/use-desk-follow';
import type { DeskZoom } from '../hooks/use-desk-zoom';

interface DeskPlayheadLiveProps {
  player: MixPlayer;
  length: number;
  playing: boolean;
  zoom: DeskZoom;
}

export const DeskPlayheadLive: FC<DeskPlayheadLiveProps> = ({ player, length, playing, zoom }) => {
  const seconds = usePlaybackSeconds(player);
  useDeskFollow(seconds, playing, zoom);

  return <KkLaneTrack.Playhead share={shareOf(seconds, length)} />;
};
