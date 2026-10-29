import { KkStudioEStage } from '@furria/ui/KkStudioEStage';
import type { FC } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { useStudioEScene } from '../hooks/use-studio-e-scene';
import { cueTextOf } from '../studio-e-copy';
import type { StageScene } from '../studio-e-stage';

interface StudioEStageSceneProps {
  player: MixPlayer;
  scene: StageScene;
  ownPath: SpotPath | null;
  marks: readonly CountMark[];
  loop: TimelineRange | null;
  gliding: boolean;
}

export const StudioEStageScene: FC<StudioEStageSceneProps> = ({
  player,
  scene,
  ownPath,
  marks,
  loop,
  gliding,
}) => {
  const frame = useStudioEScene(player, scene, ownPath, marks, loop);
  const aspect = scene.stage.depthMetres / scene.stage.widthMetres;
  const dots = frame.dots.map((dot) => (
    <KkStudioEStage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
      gliding={gliding}
    />
  ));
  const cue =
    frame.cue === null || frame.own === null ? null : (
      <KkStudioEStage.Cue
        x={frame.own.x}
        y={frame.own.y}
        text={cueTextOf(frame.cue)}
        tone={frame.cue.tone}
        side={frame.cueSide}
      />
    );

  return (
    <>
      <KkStudioEStage.Ghost points={frame.ghost} aspect={aspect} />
      {dots}
      {cue}
    </>
  );
};
