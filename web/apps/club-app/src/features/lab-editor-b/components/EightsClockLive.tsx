import { KkEightsBar } from '@furria/ui/KkEightsBar';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useEightsClock } from '../hooks/use-eights-clock';

interface EightsClockLiveProps {
  playback: StudioPlayback;
}

export const EightsClockLive: FC<EightsClockLiveProps> = ({ playback }) => {
  const clock = useEightsClock(playback);

  return (
    <KkEightsBar.Clock
      time={clock.time}
      eight={clock.eight}
      count={clock.count}
      label={clock.label}
    />
  );
};
