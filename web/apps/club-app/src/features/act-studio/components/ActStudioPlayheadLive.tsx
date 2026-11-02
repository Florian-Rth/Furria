import type { MixPlayer } from '@furria/studio/mix-player';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkStudioPlayhead } from '@furria/ui/KkStudioPlayhead';
import type { FC } from 'react';
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
