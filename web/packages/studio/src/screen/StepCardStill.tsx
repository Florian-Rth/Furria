import { Stage } from '@furria/studio/Stage';
import { WHOLE_STAGE_FRAME } from '@furria/studio/stage-framing';
import { STEP_CARD_STAGE } from '@furria/studio/step-cards-copy';
import { STUDIO_FRONT } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { studioStageDotsOf } from '@furria/studio/studio-stage-dots';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { FC } from 'react';

interface StepCardStillProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  seconds: number;
}

const NO_LIFT: ReadonlySet<number> = new Set();
const ignore = (): void => undefined;

export const StepCardStill: FC<StepCardStillProps> = ({ screen, editor, seconds }) => {
  const { dots } = studioStageDotsOf({
    scene: editor.scene,
    seconds,
    selected: [],
    dimOthers: false,
    lifted: NO_LIFT,
    frame: WHOLE_STAGE_FRAME,
    choose: ignore,
    nudge: ignore,
  });
  const shown = dots.map((dot) => (
    <Stage.Dot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
      name={dot.name}
      nameSide={dot.nameSide}
    />
  ));

  return (
    <Stage
      label={STEP_CARD_STAGE}
      stage={screen.playback.stage}
      viewpoint="dancers"
      fit="contain"
      frontLabel={STUDIO_FRONT}
      centre
    >
      {shown}
    </Stage>
  );
};
