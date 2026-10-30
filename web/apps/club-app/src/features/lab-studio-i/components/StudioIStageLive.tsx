import { KkStudioIStage } from '@furria/ui/KkStudioIStage';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioStage } from '@/features/acts/schemas';
import { useLivePoints } from '../hooks/use-studio-i-live';
import type { StageLiveTrack } from '../hooks/use-studio-i-stage';

interface StudioIStageLiveProps {
  player: MixPlayer;
  tracks: readonly StageLiveTrack[];
  stage: StudioStage;
  playing: boolean;
}

export const StudioIStageLive: FC<StudioIStageLiveProps> = ({ player, tracks, stage, playing }) => {
  const points = useLivePoints(player, tracks, stage);

  return <KkStudioIStage.Live points={points} shown={playing} />;
};
