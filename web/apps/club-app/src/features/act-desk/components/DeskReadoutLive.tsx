import { countEightsOf, countPlaceAt } from '@furria/studio/count-marks';
import { clockOf, DESK_READOUT, readoutCountOf } from '@furria/studio/desk-copy';
import type { MixPlayer } from '@furria/studio/mix-player';
import type { CountMark } from '@furria/studio/music-timeline';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';

interface DeskReadoutLiveProps {
  player: MixPlayer;
  marks: readonly CountMark[];
}

export const DeskReadoutLive: FC<DeskReadoutLiveProps> = ({ player, marks }) => {
  const seconds = usePlaybackSeconds(player);
  const eights = countEightsOf(marks);
  const place = countPlaceAt(marks, eights, seconds);

  return (
    <KkLaneBar.Readout
      label={DESK_READOUT}
      time={clockOf(seconds)}
      count={readoutCountOf(place?.eight ?? null, place?.count ?? null)}
    />
  );
};
