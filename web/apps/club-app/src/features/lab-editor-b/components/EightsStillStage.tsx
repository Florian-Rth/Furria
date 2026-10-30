import { KkEightsDot } from '@furria/ui/KkEightsDot';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import type { StageScene } from '@/features/act-practice/practice-stage';
import { EIGHTS_FRONT, EIGHTS_STAGE_LABEL } from '../eights-copy';
import { useEightsStillDots } from '../hooks/use-eights-dots';

interface EightsStillStageProps {
  scene: StageScene;
  seconds: number;
}

const still = (): void => undefined;

export const EightsStillStage: FC<EightsStillStageProps> = ({ scene, seconds }) => {
  const dots = useEightsStillDots(scene, seconds);
  const shown = dots.map((dot) => (
    <KkEightsDot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      name={dot.name}
      kind={dot.kind}
      selected={false}
      dimmed={false}
      gliding={false}
      tagSide={dot.tagSide}
      label={dot.label}
      onPress={dot.press}
      onMove={still}
      onEnd={still}
    />
  ));

  return (
    <KkStudioStage
      label={EIGHTS_STAGE_LABEL}
      frontLabel={EIGHTS_FRONT}
      widthMetres={scene.stage.widthMetres}
      depthMetres={scene.stage.depthMetres}
      artworkSvg={scene.stage.artworkSvg}
      onClear={still}
    >
      {shown}
    </KkStudioStage>
  );
};
