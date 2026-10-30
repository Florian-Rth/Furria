import { KkFocusTop } from '@furria/ui/KkFocusTop';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { fineClockOf } from '@/features/act-studio/studio-copy';
import { FOCUS_CLOCK_LABEL, laneMusicMetaOf } from '../focus-copy';

interface FocusMusicClockProps {
  screen: StudioScreen;
}

export const FocusMusicClock: FC<FocusMusicClockProps> = ({ screen }) => {
  const seconds = usePlaybackSeconds(screen.playback.player);
  const value = fineClockOf(seconds);
  const meta = laneMusicMetaOf(screen.playback.length);

  return <KkFocusTop.Readout value={value} meta={meta} label={FOCUS_CLOCK_LABEL} />;
};
