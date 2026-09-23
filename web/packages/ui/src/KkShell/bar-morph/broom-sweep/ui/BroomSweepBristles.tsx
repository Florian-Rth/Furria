import type { CSSProperties, FC } from 'react';
import { BROOM_BLADES } from '../logic/broom-geometry';

const blades = BROOM_BLADES.map((d) => <path key={d} d={d} />);

interface BroomSweepBristlesProps {
  style?: CSSProperties;
}

export const BroomSweepBristles: FC<BroomSweepBristlesProps> = ({ style }) => (
  <g style={style}>
    {blades}
    <rect x={-9.5} y={-5} width={19} height={12} rx={3} />
  </g>
);
