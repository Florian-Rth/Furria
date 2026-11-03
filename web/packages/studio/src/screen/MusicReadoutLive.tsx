import type { MixPlayer } from '@furria/studio/mix-player';
import { STEP_CARDS_READOUT } from '@furria/studio/step-cards-copy';
import { fineClockOf } from '@furria/studio/studio-copy';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import type { FC } from 'react';

interface MusicReadoutLiveProps {
  player: MixPlayer;
}

export const MusicReadoutLive: FC<MusicReadoutLiveProps> = ({ player }) => {
  const time = usePlaybackSelection(player, fineClockOf);

  return <KkLaneBar.Readout label={STEP_CARDS_READOUT} time={time} />;
};
