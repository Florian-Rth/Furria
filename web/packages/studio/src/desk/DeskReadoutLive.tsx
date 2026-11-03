import type { CountTrack } from '@furria/studio/count-marks';
import { countPlaceAt } from '@furria/studio/count-marks';
import { clockOf, DESK_READOUT, readoutCountOf } from '@furria/studio/desk-copy';
import type { MixPlayer } from '@furria/studio/mix-player';
import { usePlaybackText } from '@furria/studio/use-playback-seconds';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';

interface DeskReadoutLiveProps {
  player: MixPlayer;
  counts: CountTrack;
}

export const DeskReadoutLive: FC<DeskReadoutLiveProps> = ({ player, counts }) => {
  const countAt = (seconds: number): string => {
    const place = countPlaceAt(counts, seconds);

    return readoutCountOf(place?.eight ?? null, place?.count ?? null);
  };
  const time = usePlaybackText(player, clockOf);
  const count = usePlaybackText(player, countAt);

  return <KkLaneBar.Readout label={DESK_READOUT} time={time} count={count} />;
};
