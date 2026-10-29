import { KkStudioDPlayer } from '@furria/ui/KkStudioDPlayer';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark } from '@/features/act-player/music-timeline';
import { countLabelOf } from '../studio-d-copy';
import { beatIndexAt } from '../studio-d-practice';

interface StudioDCountProps {
  player: MixPlayer;
  marks: readonly CountMark[];
}

export const StudioDCount: FC<StudioDCountProps> = ({ player, marks }) => {
  const beat = usePlaybackSelection(player, (seconds) => beatIndexAt(marks, seconds));
  const count = marks[beat]?.count ?? null;
  const label = countLabelOf(count);

  return <KkStudioDPlayer.Count label={label} count={count} beat={beat} />;
};
