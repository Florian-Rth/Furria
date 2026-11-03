import type { MixPlayer } from '@furria/studio/mix-player';
import { clockOf } from '@furria/studio/score-copy';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkScoreTransport } from '@furria/ui/KkScoreTransport';
import type { FC } from 'react';

interface ScoreClockProps {
  player: MixPlayer;
  length: number;
}

const wholeSecondOf = (seconds: number): number => Math.floor(seconds);

export const ScoreClock: FC<ScoreClockProps> = ({ player, length }) => {
  const second = usePlaybackSelection(player, wholeSecondOf);
  const position = clockOf(second);
  const total = clockOf(length);

  return <KkScoreTransport.Clock position={position} length={total} />;
};
