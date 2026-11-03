import type { SpotPath } from '@furria/studio/choreography-motion';
import type { MixPlayer } from '@furria/studio/mix-player';
import type { CountMark, TimelineRange } from '@furria/studio/music-timeline';
import type { StageScene } from '@furria/studio/practice-stage';
import { Stage } from '@furria/studio/Stage';
import type { StudioStep } from '@furria/studio/studio-schemas';
import type { FC } from 'react';
import { usePracticeScene } from '../hooks/use-practice-scene';
import { cueTextOf } from '../practice-copy';

interface PracticeStageSceneProps {
  player: MixPlayer;
  scene: StageScene;
  ownPath: SpotPath | null;
  marks: readonly CountMark[];
  loop: TimelineRange | null;
  steps: readonly StudioStep[];
  gliding: boolean;
}

export const PracticeStageScene: FC<PracticeStageSceneProps> = ({
  player,
  scene,
  ownPath,
  marks,
  loop,
  steps,
  gliding,
}) => {
  const frame = usePracticeScene(player, scene, ownPath, marks, loop, steps);
  const dots = frame.dots.map((dot) => (
    <Stage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      muted
      turn={dot.turn}
      glide={gliding}
    />
  ));
  const cue =
    frame.cue === null || frame.own === null ? null : (
      <Stage.Cue
        x={frame.own.x}
        y={frame.own.y}
        text={cueTextOf(frame.cue)}
        tone={frame.cue.tone}
        side={frame.cueSide}
      />
    );
  const way = frame.way === null ? null : <Stage.Path points={frame.way.points} kind="way" />;
  const wayMarks = frame.way === null ? [] : frame.way.marks;
  const counts = wayMarks.map((mark) => (
    <Stage.Count
      key={`${mark.count}-${mark.x}-${mark.y}`}
      x={mark.x}
      y={mark.y}
      count={mark.count}
    />
  ));
  const target = frame.ghost.length < 2 ? undefined : frame.ghost.at(-1);
  const ghostTarget = target === undefined ? null : <Stage.Target x={target.x} y={target.y} />;

  return (
    <>
      {way}
      {counts}
      <Stage.Path points={frame.ghost} kind="ghost" />
      {ghostTarget}
      {dots}
      {cue}
    </>
  );
};
