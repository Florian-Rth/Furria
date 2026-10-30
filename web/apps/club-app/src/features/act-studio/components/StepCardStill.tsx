import { KkLaneDot } from '@furria/ui/KkLaneDot';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import { useStepCardDots } from '../hooks/use-step-card-dots';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STEP_CARD_STAGE } from '../step-cards-copy';
import { STUDIO_FRONT } from '../studio-copy';

interface StepCardStillProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  seconds: number;
}

const ignore = (): void => undefined;

export const StepCardStill: FC<StepCardStillProps> = ({ screen, editor, seconds }) => {
  const { stage } = screen.playback;
  const dots = useStepCardDots(screen, editor, seconds).map((dot) => (
    <KkLaneDot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      name={dot.name}
      kind={dot.kind}
      selected={false}
      dimmed={false}
      label={dot.label}
      nameAbove={dot.nameAbove}
      interactive={false}
      onPress={ignore}
      onMove={ignore}
      onEnd={ignore}
      onNudge={ignore}
    />
  ));

  return (
    <KkStudioStage
      label={STEP_CARD_STAGE}
      frontLabel={STUDIO_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      onClear={ignore}
    >
      {dots}
    </KkStudioStage>
  );
};
