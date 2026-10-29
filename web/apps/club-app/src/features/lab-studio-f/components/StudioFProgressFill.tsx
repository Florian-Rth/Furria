import { KkStudioFProgressFill } from '@furria/ui/KkStudioFProgressFill';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioStep } from '@/features/acts/schemas';
import { stepFillOf } from '../studio-f-lesson';

interface StudioFProgressFillProps {
  player: MixPlayer;
  step: StudioStep | null;
}

export const StudioFProgressFill: FC<StudioFProgressFillProps> = ({ player, step }) => {
  const seconds = usePlaybackSeconds(player);
  const value = stepFillOf(step, seconds);

  return <KkStudioFProgressFill value={value} />;
};
