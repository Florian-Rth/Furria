import type { KkStudioDStageSize } from '@furria/ui/KkStudioDStage';
import { KkStudioDStage } from '@furria/ui/KkStudioDStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioDStageScene } from '../studio-d-stage';
import { dotsAt } from '../studio-d-stage';

interface StudioDDotsProps {
  player: MixPlayer;
  scene: StudioDStageScene;
  size: KkStudioDStageSize;
}

export const StudioDDots: FC<StudioDDotsProps> = ({ player, scene, size }) => {
  const seconds = usePlaybackSeconds(player);
  const dots = dotsAt(scene, seconds).map((dot) => (
    <KkStudioDStage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
      size={size}
    />
  ));

  return <>{dots}</>;
};
