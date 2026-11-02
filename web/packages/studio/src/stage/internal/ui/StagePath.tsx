import type { KkStageInkLineKind, KkStageInkPoint } from '@furria/ui/KkStageInk';
import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';

const DRAWN_POINTS = 2;

interface StagePathProps {
  points: readonly KkStageInkPoint[];
  kind: KkStageInkLineKind;
}

export const StagePath: FC<StagePathProps> = ({ points, kind }) =>
  points.length < DRAWN_POINTS ? null : <KkStageInk.Line points={points} kind={kind} />;
