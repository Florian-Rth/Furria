import { KkStudioIWave } from '@furria/ui/KkStudioIWave';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { usePlayheadShare } from '../hooks/use-studio-i-live';

interface StudioIPlayheadLiveProps {
  player: MixPlayer;
  window: TimelineRange;
}

export const StudioIPlayheadLive: FC<StudioIPlayheadLiveProps> = ({ player, window }) => {
  const share = usePlayheadShare(player, window);

  return <KkStudioIWave.Playhead share={share} />;
};
