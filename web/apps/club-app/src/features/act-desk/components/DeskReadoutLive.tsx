import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark } from '@/features/act-player/music-timeline';
import { clockOf, DESK_READOUT, readoutCountOf } from '../desk-copy';
import { countPlaceAt } from '../desk-time';

interface DeskReadoutLiveProps {
  player: MixPlayer;
  marks: readonly CountMark[];
}

export const DeskReadoutLive: FC<DeskReadoutLiveProps> = ({ player, marks }) => {
  const seconds = usePlaybackSeconds(player);
  const place = countPlaceAt(marks, seconds);

  return (
    <KkLaneBar.Readout
      label={DESK_READOUT}
      time={clockOf(seconds)}
      count={readoutCountOf(place?.eight ?? null, place?.count ?? null)}
    />
  );
};
