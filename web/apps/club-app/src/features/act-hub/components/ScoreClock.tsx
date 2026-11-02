import { KkScoreTransport } from '@furria/ui/KkScoreTransport';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { clockOf } from '../score-copy';

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
