import { KkStudioPlayhead } from '@furria/ui/KkStudioPlayhead';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { shareInSpan } from '../studio-timing';

interface ActStudioPlayheadLiveProps {
  player: MixPlayer;
  start: number;
  end: number;
}

export const ActStudioPlayheadLive: FC<ActStudioPlayheadLiveProps> = ({ player, start, end }) => {
  const share = usePlaybackSelection(player, (seconds) => shareInSpan(seconds, { start, end }));

  return <KkStudioPlayhead share={share} />;
};
