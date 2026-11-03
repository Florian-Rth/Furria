import type { MixPlayer } from '@furria/studio/mix-player';
import { clockOf } from '@furria/studio/score-copy';
import { usePlaybackText } from '@furria/studio/use-playback-seconds';
import { KkScoreTransport } from '@furria/ui/KkScoreTransport';
import type { FC } from 'react';

interface ScoreClockProps {
  player: MixPlayer;
  length: number;
}

export const ScoreClock: FC<ScoreClockProps> = ({ player, length }) => {
  const position = usePlaybackText(player, clockOf);
  const total = clockOf(length);

  return <KkScoreTransport.Clock position={position} length={total} />;
};
