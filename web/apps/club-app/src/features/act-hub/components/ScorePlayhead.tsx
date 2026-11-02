import type { MixPlayer } from '@furria/studio/mix-player';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkScoreTrack } from '@furria/ui/KkScoreTrack';
import type { FC } from 'react';

interface ScorePlayheadProps {
  player: MixPlayer;
  length: number;
  bars: readonly number[];
  playing: boolean;
}

export const ScorePlayhead: FC<ScorePlayheadProps> = ({ player, length, bars, playing }) => {
  const seconds = usePlaybackSeconds(player);
  const share = length > 0 ? seconds / length : 0;

  if (share <= 0 && !playing) {
    return null;
  }

  return (
    <>
      <KkScoreTrack.Played bars={bars} share={share} />
      <KkScoreTrack.Playhead share={share} />
    </>
  );
};
