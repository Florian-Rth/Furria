import type { CountMark } from '@furria/studio/music-timeline';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { countPlaceAt } from '../step-cards';
import { readoutCountOf, STEP_CARDS_READOUT } from '../step-cards-copy';
import { fineClockOf } from '../studio-copy';

interface StepCardsReadoutLiveProps {
  player: MixPlayer;
  marks: readonly CountMark[];
  eights: readonly number[];
}

export const StepCardsReadoutLive: FC<StepCardsReadoutLiveProps> = ({ player, marks, eights }) => {
  const seconds = usePlaybackSeconds(player);
  const place = countPlaceAt(marks, eights, seconds);

  return (
    <KkLaneBar.Readout
      label={STEP_CARDS_READOUT}
      time={fineClockOf(seconds)}
      count={readoutCountOf(place?.eight ?? null, place?.count ?? null)}
    />
  );
};
