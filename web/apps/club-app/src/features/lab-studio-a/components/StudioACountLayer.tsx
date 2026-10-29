import { KkStudioACount } from '@furria/ui/KkStudioACount';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioACount } from '../hooks/use-studio-a-count';
import type { StudioAPractice } from '../hooks/use-studio-a-practice';
import { StudioAClockLive } from './StudioAClockLive';

interface StudioACountLayerProps {
  playback: StudioPlayback;
  practice: StudioAPractice;
}

export const StudioACountLayer: FC<StudioACountLayerProps> = ({ playback, practice }) => {
  const count = useStudioACount(playback, practice);
  const clock = <StudioAClockLive player={playback.player} length={playback.length} />;

  return (
    <KkStudioACount
      count={count.count}
      countLabel={count.countLabel}
      title={count.title}
      meta={count.meta}
      clock={clock}
    />
  );
};
