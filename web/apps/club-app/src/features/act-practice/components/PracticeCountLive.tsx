import { KkPracticeCount } from '@furria/ui/KkPracticeCount';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
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
