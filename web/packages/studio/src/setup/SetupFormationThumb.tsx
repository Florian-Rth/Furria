import type { ViewShare } from '@furria/studio/practice-stage';
import { Stage } from '@furria/studio/Stage';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { FC } from 'react';

interface SetupFormationThumbProps {
  stage: StudioStage;
  points: readonly ViewShare[];
}

export const SetupFormationThumb: FC<SetupFormationThumbProps> = ({ stage, points }) => {
  const dots = points.map((point, index) => (
    <Stage.Dot
      key={`${point.x}:${point.y}:${index}`}
      x={point.x}
      y={point.y}
      number={index + 1}
      kind="cast"
      density="thumb"
    />
  ));

  return (
    <Stage stage={stage} viewpoint="dancers" density="thumb">
      {dots}
    </Stage>
  );
};
