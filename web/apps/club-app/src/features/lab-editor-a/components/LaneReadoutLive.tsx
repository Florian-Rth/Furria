import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark } from '@/features/act-player/music-timeline';
import { clockOf, LANE_READOUT, readoutCountOf } from '../lane-copy';
import { countPlaceAt } from '../lane-time';

interface LaneReadoutLiveProps {
  player: MixPlayer;
  marks: readonly CountMark[];
}

export const LaneReadoutLive: FC<LaneReadoutLiveProps> = ({ player, marks }) => {
  const seconds = usePlaybackSeconds(player);
  const place = countPlaceAt(marks, seconds);

  return (
    <KkLaneBar.Readout
      label={LANE_READOUT}
      time={clockOf(seconds)}
      count={readoutCountOf(place?.eight ?? null, place?.count ?? null)}
    />
  );
};
