import { KkStudioHPlayhead } from '@furria/ui/KkStudioHPlayhead';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { shareInSpan } from '../studio-h-timing';

interface StudioHPlayheadLiveProps {
  player: MixPlayer;
  start: number;
  end: number;
}

export const StudioHPlayheadLive: FC<StudioHPlayheadLiveProps> = ({ player, start, end }) => {
  const share = usePlaybackSelection(player, (seconds) => shareInSpan(seconds, { start, end }));

  return <KkStudioHPlayhead share={share} />;
};
