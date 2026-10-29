import { KkStudioCMoment } from '@furria/ui/KkStudioCMoment';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
import { eightLabelOf } from '../studio-c-copy';

interface StudioCCountProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const StudioCCount: FC<StudioCCountProps> = ({ player, segments }) => {
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );
  const eight = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.eight ?? null,
  );
  const eightLabel = eightLabelOf(eight);

  return <KkStudioCMoment.Count count={count} eightLabel={eightLabel} />;
};
