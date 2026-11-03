import type { CountTrack } from '@furria/studio/count-marks';
import { countPlaceAt } from '@furria/studio/count-marks';
import { clockOf, DESK_READOUT, readoutCountOf } from '@furria/studio/desk-copy';
import type { MixPlayer } from '@furria/studio/mix-player';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';

interface DeskReadoutLiveProps {
  player: MixPlayer;
  counts: CountTrack;
}

export const DeskReadoutLive: FC<DeskReadoutLiveProps> = ({ player, counts }) => {
  const seconds = usePlaybackSeconds(player);
  const place = countPlaceAt(counts, seconds);

  return (
    <KkLaneBar.Readout
      label={DESK_READOUT}
      time={clockOf(seconds)}
      count={readoutCountOf(place?.eight ?? null, place?.count ?? null)}
    />
  );
};
