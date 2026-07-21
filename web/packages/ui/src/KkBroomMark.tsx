import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';

const broomParts = (
  <>
    <rect x={-2.6} y={-44} width={5.2} height={36.5} rx={2.6} />
    <circle cx={0} cy={-44} r={4.1} />
    <rect x={-9.5} y={-5} width={19} height={12} rx={3} />
    <path d="M-8.5,9.5 L-21,48 Q0,53 21,48 L8.5,9.5 Z" />
  </>
);

interface KkBroomMarkProps {
  size?: number;
  sx?: SxProps<Theme>;
}

export const KkBroomMark: FC<KkBroomMarkProps> = ({ size = 34, sx }) => (
  <Box
    component="svg"
    viewBox="0 0 60 60"
    width={size}
    height={size}
    aria-hidden
    sx={[{ display: 'block', fill: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <g transform="translate(30 33)">
      <g transform="rotate(-122) scale(0.92)">{broomParts}</g>
      <g transform="rotate(122) scale(0.92)">{broomParts}</g>
    </g>
  </Box>
);
