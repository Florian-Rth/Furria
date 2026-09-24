import type { CSSProperties, FC } from 'react';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';
import { BroomSweepBristles } from './BroomSweepBristles';
import { BroomSweepHandle } from './BroomSweepHandle';

const PIVOT: CSSProperties = { transformBox: 'view-box', transformOrigin: '0 0' };
const BRISTLE_STYLE: CSSProperties = {
  ...PIVOT,
  transform: varOf(SWEEP_VAR.foldBristle, 'none'),
};

interface BroomSweepFoldBroomProps {
  pose: string;
}

export const BroomSweepFoldBroom: FC<BroomSweepFoldBroomProps> = ({ pose }) => {
  const style: CSSProperties = { ...PIVOT, transform: varOf(pose, 'none') };

  return (
    <g style={style}>
      <BroomSweepHandle />
      <BroomSweepBristles style={BRISTLE_STYLE} />
    </g>
  );
};
