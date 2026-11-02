import type { MixPlayer } from '@furria/studio/mix-player';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { countAt } from '@furria/studio/music-timeline';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkPracticeCount } from '@furria/ui/KkPracticeCount';
import type { FC } from 'react';
import { countLabelOf } from '../practice-copy';

interface PracticeCountLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const PracticeCountLive: FC<PracticeCountLiveProps> = ({ player, segments }) => {
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );
  const label = countLabelOf(count);

  return <KkPracticeCount count={count} label={label} />;
};
