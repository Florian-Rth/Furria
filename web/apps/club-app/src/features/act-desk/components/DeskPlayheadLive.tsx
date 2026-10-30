import { KkLaneTrack } from '@furria/ui/KkLaneTrack';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
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
