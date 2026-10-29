import { KkStudioFCount } from '@furria/ui/KkStudioFCount';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { countAt } from '@/features/act-player/music-timeline';
import { STUDIO_F_COUNT_LABEL } from '../studio-f-copy';

interface StudioFCountProps {
  playback: StudioPlayback;
}

export const StudioFCount: FC<StudioFCountProps> = ({ playback }) => {
  const { player, segments } = playback;
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );

  return <KkStudioFCount count={count} label={STUDIO_F_COUNT_LABEL} />;
};
