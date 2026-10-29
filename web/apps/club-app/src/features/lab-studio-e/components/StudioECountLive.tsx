import { KkStudioECount } from '@furria/ui/KkStudioECount';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
import { countLabelOf } from '../studio-e-copy';

interface StudioECountLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const StudioECountLive: FC<StudioECountLiveProps> = ({ player, segments }) => {
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );
  const label = countLabelOf(count);

  return <KkStudioECount count={count} label={label} />;
};
