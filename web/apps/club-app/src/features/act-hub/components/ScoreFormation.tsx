import { Stage } from '@furria/studio/Stage';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { KkStageInkDensity } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import type { ScoreDot } from '../score-formation';
import { entranceOf, scoreDotKindOf } from '../score-formation';

interface ScoreFormationProps {
  label?: string;
  stage: StudioStage;
  dots: readonly ScoreDot[];
  density: KkStageInkDensity;
  frontLabel?: string;
  entranceDelay?: number | null;
}

export const ScoreFormation: FC<ScoreFormationProps> = ({
  label,
  stage,
  dots,
  density,
  frontLabel,
  entranceDelay = null,
}) => {
  const full = density === 'full';
  const marks = dots.map((dot) => (
    <Stage.Dot
      key={dot.id}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={scoreDotKindOf(dot)}
      density={density}
      from={entranceOf(dot, entranceDelay)}
    />
  ));

  return (
    <Stage
      label={label}
      stage={stage}
      viewpoint="audience"
      density={density}
      frontLabel={frontLabel}
      centre={full}
    >
      {marks}
    </Stage>
  );
};
