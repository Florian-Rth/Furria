import type { CountTrack } from '@furria/studio/count-marks';
import { countPlaceAt } from '@furria/studio/count-marks';
import type { MixPlayer } from '@furria/studio/mix-player';
import { readoutCountOf, STEP_CARDS_READOUT } from '@furria/studio/step-cards-copy';
import { fineClockOf } from '@furria/studio/studio-copy';
import { usePlaybackText } from '@furria/studio/use-playback-seconds';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';

interface StepCardsReadoutLiveProps {
  player: MixPlayer;
  counts: CountTrack;
}

export const StepCardsReadoutLive: FC<StepCardsReadoutLiveProps> = ({ player, counts }) => {
  const countAt = (seconds: number): string => {
    const place = countPlaceAt(counts, seconds);

    return readoutCountOf(place?.eight ?? null, place?.count ?? null);
  };
  const time = usePlaybackText(player, fineClockOf);
  const count = usePlaybackText(player, countAt);

  return <KkLaneBar.Readout label={STEP_CARDS_READOUT} time={time} count={count} />;
};
