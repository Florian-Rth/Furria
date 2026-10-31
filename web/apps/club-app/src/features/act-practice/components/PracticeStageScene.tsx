import { KkPracticeStage } from '@furria/ui/KkPracticeStage';
import type { FC } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { usePracticeScene } from '../hooks/use-practice-scene';
import { cueTextOf } from '../practice-copy';
import type { StageScene } from '../practice-stage';

interface PracticeStageSceneProps {
  player: MixPlayer;
  scene: StageScene;
  ownPath: SpotPath | null;
  marks: readonly CountMark[];
  loop: TimelineRange | null;
  gliding: boolean;
}

export const PracticeStageScene: FC<PracticeStageSceneProps> = ({
  player,
  scene,
  ownPath,
  marks,
  loop,
  gliding,
}) => {
  const frame = usePracticeScene(player, scene, ownPath, marks, loop);
  const aspect = scene.stage.depthMetres / scene.stage.widthMetres;
  const dots = frame.dots.map((dot) => (
    <KkPracticeStage.Dot
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
      <KkPracticeStage.Cue
        x={frame.own.x}
        y={frame.own.y}
        text={cueTextOf(frame.cue)}
        tone={frame.cue.tone}
        side={frame.cueSide}
      />
    );

  return (
    <>
      <KkPracticeStage.Ghost points={frame.ghost} aspect={aspect} />
      {dots}
      {cue}
    </>
  );
};
