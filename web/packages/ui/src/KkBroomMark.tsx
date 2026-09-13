import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';

const strawBlades = [
  'M-8.28,6 L-20.45,48 L-15.55,49.22 L-6.29,6 Z',
  'M-5.85,6 L-14.45,49.22 L-9.55,50.04 L-3.86,6 Z',
  'M-3.42,6 L-8.45,50.04 L-3.55,50.45 L-1.43,6 Z',
  'M-0.99,6 L-2.45,50.45 L2.45,50.45 L0.99,6 Z',
  'M1.43,6 L3.55,50.45 L8.45,50.04 L3.42,6 Z',
  'M3.86,6 L9.55,50.04 L14.45,49.22 L5.85,6 Z',
  'M6.29,6 L15.55,49.22 L20.45,48 L8.28,6 Z',
].map((d) => <path key={d} d={d} />);

const broomParts = (
  <>
    <rect x={-2.6} y={-44} width={5.2} height={44} rx={2.6} />
    <circle cx={0} cy={-44} r={4.1} />
    {strawBlades}
    <rect x={-9.5} y={-5} width={19} height={12} rx={3} />
  </>
);

interface KkBroomMarkProps {
  size?: number;
  sx?: SxProps<Theme>;
}

export const KkBroomMark: FC<KkBroomMarkProps> = ({ size = 34, sx }) => (
  <Box
    component="svg"
    viewBox="-52 -51 104 104"
    width={size}
    height={size}
    aria-hidden
    sx={[{ display: 'block', fill: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <g transform="rotate(-135 0 1)">{broomParts}</g>
    <g transform="rotate(135 0 1)">{broomParts}</g>
  </Box>
);
