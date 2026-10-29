import { KkStudioAStage } from '@furria/ui/KkStudioAStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioAStageScene } from '../studio-a-stage';
import { dotsAt } from '../studio-a-stage';

interface StudioADotsProps {
  player: MixPlayer;
  scene: StudioAStageScene;
}

export const StudioADots: FC<StudioADotsProps> = ({ player, scene }) => {
  const seconds = usePlaybackSeconds(player);
  const dots = dotsAt(scene, seconds).map((dot) => (
    <KkStudioAStage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
    />
  ));

  return <>{dots}</>;
};
